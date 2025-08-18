// AI Service - Clean, functional, no hardcoding
// The AI decides everything based on tool descriptions and system prompt

import { generateText, streamText, tool, stepCountIs } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { PrismaClient } from '../../generated/prisma/index.js'
import * as perplexityService from './perplexity.service.js'
import * as multiSpeakerTTS from './multiSpeakerTTS.service.js'
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

MOST IMPORTANT RULE:
Focus on what the user JUST said. Respond naturally to their CURRENT message.
Previous messages are for context only - don't keep referencing old topics unless directly asked.

PERSONALITY:
- Be warm, friendly, and conversational
- Respond naturally like a friend would
- Don't constantly remind users about previous questions

WHEN TO SEARCH NEWS:
- ONLY when users explicitly ask for current/latest/recent news or events
- When users say "yes" to your offer to search news
- When users specifically request audio generation for news

WHEN NOT TO SEARCH:
- Follow-up questions or comments
- General conversation or personal comments
- When users change the topic

🎙️ CRITICAL: WHEN YOU USE THE SEARCH TOOL (NEWS RESPONSES):
Your response will be converted to MULTI-SPEAKER audio. Format as a dialogue between Host and Guest.

MULTI-SPEAKER FORMAT:
- Start each line with "Host:" or "Guest:"
- Alternate between speakers naturally
- NO markdown, NO bullet points
- Write conversational dialogue like a podcast
- Host asks questions/introduces topics
- Guest provides details/analysis

GOOD EXAMPLE:
"Host: Good morning! We have some fascinating tech news today about Nvidia and Jensen Huang.
Guest: Yes, it's remarkable! Nvidia has reached a market cap of 4 trillion dollars under Huang's leadership.
Host: That's incredible growth. What makes his leadership style unique?
Guest: Well, he's known for his hands-on approach, personally overseeing employee compensation. And interestingly, Nvidia is becoming somewhat of a family enterprise.
Host: How so?
Guest: His children are now taking executive roles in the company, which is quite unusual for a tech giant of this scale."

BAD EXAMPLE (single speaker):
"Good morning! In technology news today, Jensen Huang continues to lead Nvidia..."

NATURAL RESPONSES (non-news):
- "I love you" → Respond warmly, don't mention news
- "What did I just ask?" → Simply answer what they asked, then move on
- Personal comments → Engage naturally, don't redirect to old topics

Keep responses under 500 words. Be helpful but not repetitive.`,
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
      const startTime = Date.now()
      
      // Check if text has multi-speaker format
      const isMultiSpeaker = text.includes('Host:') && text.includes('Guest:')
      
      let audioContent
      if (isMultiSpeaker) {
        console.log('   🎭 Detected multi-speaker dialogue format')
        const hostLines = (text.match(/Host:/g) || []).length
        const guestLines = (text.match(/Guest:/g) || []).length
        console.log(`   📊 Dialogue: ${hostLines} Host lines, ${guestLines} Guest lines`)
        
        const result = await multiSpeakerTTS.generateMultiSpeakerAudio(text, [
          { name: 'Host', voice: 'Kore' },
          { name: 'Guest', voice: 'Puck' }
        ])
        audioContent = result.audioContent
      } else {
        console.log('   🎤 Using single speaker format')
        const result = await multiSpeakerTTS.generateSingleSpeakerAudio(text)
        audioContent = result.audioContent
      }
      
      console.log(`   TTS complete in ${Date.now() - startTime}ms`)
      
      // Upload to S3
      console.log('   Uploading to S3...')
      const audioBuffer = Buffer.from(audioContent, 'base64')
      const s3Result = await s3Service.uploadAudio(audioBuffer, assistantMsg.id, 'wav')
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