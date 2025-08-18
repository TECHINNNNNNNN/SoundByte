import { OpenAI } from 'openai'
import { streamText } from 'ai'
import { openai as vercelOpenAI } from '@ai-sdk/openai'
import * as perplexityService from './perplexity.service.js'
import * as ttsService from './tts.service.js'
import * as s3Service from './s3.service.js'
import { PrismaClient } from '../../generated/prisma/index.js'

const prisma = new PrismaClient()
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

// get conversation context
export const getConversationContext = async (conversationId, userId) => {
    // verify user owns this conversation
    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            userId
        },
        include: {
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 10
            }
        }
    })

    if (!conversation) {
        throw new Error('Conversation not found or unauthorized')
    }

    return conversation.messages.reverse()
}