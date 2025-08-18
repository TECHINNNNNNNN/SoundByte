// AI Service - Clean, functional, no hardcoding
// The AI decides everything based on tool descriptions and system prompt

import { generateText, streamText, tool, stepCountIs } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { PrismaClient } from '../../generated/prisma/index.js'
import * as perplexityService from './perplexity.service.js'
import * as ttsService from './tts.service.js'
import * as s3Service from './s3.service.js'

const prisma = new PrismaClient()

/**
 * Define the news search tool using the tool() helper
 * AI SDK 5: uses 'inputSchema' instead of 'parameters'
 */
const searchNewsTool = tool({
  description: 'Search for current news ONLY when user explicitly asks for latest/recent/today news or agrees to news search. Do NOT use for follow-up questions or general conversation.',
  inputSchema: z.object({
    query: z.string().describe('The news topic or question to research'),
    timeframe: z.string().optional().describe('How recent: today, week, or month').default('week')
  }),
  execute: async ({ query, timeframe }) => {
    console.log(`🔍 AI decided to search news: "${query}" (${timeframe})`)
    
    // Call real Perplexity API
    const result = await perplexityService.researchNews(query, timeframe)
    console.log(`✅ Research complete, got ${result.content.length} chars`)
    
    // Return just the content string for better compatibility
    return result.content
  }
})

/**
 * Process a message with AI - clean and simple
 */
export const processMessage = async (conversationId, userMessage, userId) => {
  // 1. Get conversation history (for context)
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        take: 10
      }
    }
  })

  if (!conversation) {
    throw new Error('Conversation not found')
  }

  // 2. Save user message
  await prisma.message.create({
    data: {
      conversationId,
      content: userMessage,
      role: 'user'
    }
  })

  // 3. Create placeholder for assistant response
  const assistantMsg = await prisma.message.create({
    data: {
      conversationId,
      content: '',
      role: 'assistant'
    }
  })

  // 4. Generate response with tools (not streaming for reliability)
  const result = await generateText({
    model: openai('gpt-4o'),
    system: `You are SoundByte, a friendly and conversational AI assistant who helps people stay informed.

PERSONALITY:
- Be warm, friendly, and conversational
- Remember what was just discussed in the conversation
- Offer to help with news and audio generation when appropriate

WHEN TO SEARCH NEWS:
- ONLY when users explicitly ask for current/latest/recent news or events
- When users say "yes" to your offer to search news
- When users specifically request audio generation for news

WHEN NOT TO SEARCH:
- Follow-up questions about previous responses
- General conversation or greetings
- When users are clarifying or asking about what they just asked

CONVERSATION AWARENESS:
- If asked "what did I just ask?" or similar, acknowledge their previous question
- Don't repeat the same news search if continuing the same topic
- Offer options: "Want me to find more details?" or "Should I look for updates?"

RESPONSE STYLE:
- For greetings: Be friendly and offer help with today's news
- For follow-ups: Acknowledge the context and offer next steps
- Keep responses under 500 words for potential audio generation
- End with helpful suggestions when appropriate`,
    messages: [
      ...conversation.messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user', content: userMessage }
    ],
    tools: {
      searchNews: searchNewsTool
    },
    toolChoice: 'auto',
    maxSteps: 2,
    stopWhen: stepCountIs(2)
  })
  
  // Extract response details
  const { text, toolCalls, steps } = result
  
  console.log(`📊 Total steps: ${steps?.length || 0}`)
  console.log(`📝 Final text length: ${text?.length || 0}`)
  
  // Debug logging to understand the structure
  console.log('🔍 DEBUG - toolCalls:', JSON.stringify(toolCalls, null, 2))
  console.log('🔍 DEBUG - steps structure:')
  steps?.forEach((step, i) => {
    console.log(`   Step ${i + 1}:`)
    console.log(`     - toolCalls: ${step.toolCalls?.length || 0}`)
    if (step.toolCalls?.length > 0) {
      step.toolCalls.forEach(tc => {
        console.log(`       * Tool: ${tc.toolName}`)
      })
    }
    console.log(`     - text length: ${step.text?.length || 0}`)
  })
  
  // Check if searchNews tool was used - need to check in steps
  const allToolCalls = steps?.flatMap(step => step.toolCalls || []) || []
  const searchNewsUsed = allToolCalls.some(call => call.toolName === 'searchNews')
  
  if (searchNewsUsed) {
    console.log('🔍 News search tool was used - will generate audio')
  } else {
    console.log('💬 General response - no audio needed')
  }
  
  // Update message with final text
  await prisma.message.update({
    where: { id: assistantMsg.id },
    data: { content: text || '' }
  })
  
  // Generate audio if searchNews was used
  let audioUrl = null
  if (searchNewsUsed && text && text.length > 10) {
    console.log('🎵 Generating audio for news response...')
    console.log(`   Text length: ${text.length} chars`)
    
    try {
      // Generate audio synchronously - no truncation!
      const startTime = Date.now()
      console.log('   Calling TTS...')
      const { audioContent } = await ttsService.generateAudio(text)
      console.log(`   TTS complete in ${Date.now() - startTime}ms`)
      
      // Upload to S3
      console.log('   Uploading to S3...')
      const audioBuffer = Buffer.from(audioContent, 'base64')
      const s3Result = await s3Service.uploadAudio(audioBuffer, assistantMsg.id)
      audioUrl = s3Result.url
      
      // Update message with audio URL
      await prisma.message.update({
        where: { id: assistantMsg.id },
        data: { audioUrl }
      })
      
      console.log(`✅ Audio generated and saved: ${audioUrl}`)
    } catch (error) {
      console.error('❌ Audio generation failed:', error.message)
      // Continue without audio - don't fail the whole request
    }
  }
  
  return {
    text,
    messageId: assistantMsg.id,
    audioUrl,
    usedSearchTool: searchNewsUsed
  }
}

// Background function removed - we now do synchronous audio generation