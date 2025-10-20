// ai stuff - uses tools when it wants

import { generateText, tool, stepCountIs } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { prisma } from '../lib/db.js';
import * as perplexityService from './perplexity.service.js'
import * as multiSpeakerTTS from './multiSpeakerTTS.service.js'
import * as s3Service from './s3.service.js'
import {
  ENHANCED_TOOL_DESCRIPTION,
  AUDIO_GENERATION_TOOL_DESCRIPTION,
  ENHANCED_SYSTEM_PROMPT,
  CONVERSATION_STATE_PROMPT
} from './prompts/enhanced-system-prompt.js'

// news search tool
const searchNewsTool = tool({
  description: ENHANCED_TOOL_DESCRIPTION,
  inputSchema: z.object({
    query: z.string().describe('The news topic or question to research'),
    timeframe: z.string().optional().describe('How recent: today, week, or month').default('week')
  }),
  execute: async ({ query, timeframe }) => {
    console.log(`🔍 AI decided to search news: "${query}" (${timeframe})`)
    const result = await perplexityService.researchNews(query, timeframe)
    console.log(`✅ Research complete, got ${result.content.length} chars`)
    return result.content
  }
})

// hacky but works
let currentMessageId = null

// audio gen tool - only fires when user confirms
const generateAudioTool = tool({
  description: AUDIO_GENERATION_TOOL_DESCRIPTION,
  inputSchema: z.object({
    content: z.string().describe('The EXACT dialogue to convert to audio. Must be in Host:/Guest: format with alternating speakers.')
  }),
  execute: async ({ content }) => {
    console.log(`🎵 Generating audio for message ${currentMessageId}`)

    try {
      const isMultiSpeaker = content.includes('Host:') && content.includes('Guest:')

      if (!isMultiSpeaker) {
        throw new Error('Content must be in Host:/Guest: dialogue format')
      }

      // Generate the actual audio
      const { audioContent } = await multiSpeakerTTS.generateMultiSpeakerAudio(content, [
        { name: 'Host', voice: 'Kore' },
        { name: 'Guest', voice: 'Puck' }
      ])

      // Upload to S3
      const audioBuffer = Buffer.from(audioContent, 'base64')
      const { url } = await s3Service.uploadAudio(audioBuffer, currentMessageId, 'wav')

      // Update the message with audio URL
      await prisma.message.update({
        where: { id: currentMessageId },
        data: { audioUrl: url }
      })

      console.log(`✅ Audio generated and saved: ${url}`)
      return `I've created the audio podcast! You can listen to it now using the audio player below.`
    } catch (error) {
      console.error('❌ Audio generation failed:', error.message)
      return `Sorry, I couldn't generate the audio: ${error.message}`
    }
  }
})

export const processMessage = async (conversationId, userMessage, userId) => {
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

  await prisma.message.create({
    data: {
      conversationId,
      content: userMessage,
      role: 'user'
    }
  })

  const assistantMsg = await prisma.message.create({
    data: {
      conversationId,
      content: '',
      role: 'assistant'
    }
  })

  currentMessageId = assistantMsg.id

  // not streaming cuz tools
  const result = await generateText({
    model: openai('gpt-5'),
    system: ENHANCED_SYSTEM_PROMPT + CONVERSATION_STATE_PROMPT,
    messages: [
      ...conversation.messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user', content: userMessage }
    ],
    tools: {
      searchNews: searchNewsTool,
      generateAudio: generateAudioTool
    },
    toolChoice: 'auto',
    stopWhen: stepCountIs(5)  // prevent infinite loops
  })

  const { text, steps } = result

  console.log(`📊 Total steps: ${steps?.length || 0}`)
  console.log(`📝 Final text length: ${text?.length || 0}`)

  const allToolCalls = steps?.flatMap(step => step.toolCalls || []) || []
  const searchNewsUsed = allToolCalls.some(call => call.toolName === 'searchNews')
  const audioGenerated = allToolCalls.some(call => call.toolName === 'generateAudio')

  if (searchNewsUsed) {
    console.log('🔍 News search tool was used')
  }
  if (audioGenerated) {
    console.log('🎵 Audio was generated per user request')
  }

  // shouldn't happen but just in case
  let finalText = text || ''
  if (!finalText && steps?.length > 1) {
    console.log('⚠️ Empty text after tool usage - this should not happen with stopWhen')
    finalText = 'I completed the requested action. Please let me know if you need anything else!'
  }

  await prisma.message.update({
    where: { id: assistantMsg.id },
    data: { content: finalText }
  })

  const audioUrl = audioGenerated ?
    (await prisma.message.findUnique({ where: { id: assistantMsg.id } }))?.audioUrl :
    null

  return {
    text: finalText,
    messageId: assistantMsg.id,
    audioUrl,
    usedSearchTool: searchNewsUsed,
    audioGenerated
  }
}

