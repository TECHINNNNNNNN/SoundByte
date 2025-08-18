// Perplexity Service - Using Vercel AI SDK
import { perplexity } from '@ai-sdk/perplexity'
import { generateText } from 'ai'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Research news using Perplexity via Vercel AI SDK
 */
export const researchNews = async (query, timeframe = 'week') => {
  try {
    const { text, usage } = await generateText({
      model: perplexity('sonar-pro'),
      prompt: query,
      system: `You are a news research assistant. 
Provide factual, up-to-date information about current events.
Focus on the most recent developments.
Keep responses concise (under 500 words) for audio narration.
Include key facts and important details.`,
      temperature: 0.2,
      maxTokens: 1500
    })
    
    return {
      content: text,
      sources: [], // Perplexity doesn't return sources via AI SDK generateText
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('Perplexity error:', error)
    return {
      content: `Unable to fetch current news. Please try again.`,
      sources: [],
      error: error.message
    }
  }
}