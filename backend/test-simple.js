import { generateText, tool } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import * as perplexityService from './src/services/perplexity.service.js'
import dotenv from 'dotenv'

dotenv.config()

// Simple test tool
const testSearchTool = tool({
  description: 'Search for news',
  inputSchema: z.object({
    query: z.string()
  }),
  execute: async ({ query }) => {
    console.log(`Searching for: ${query}`)
    const result = await perplexityService.researchNews(query, 'today')
    return result.content
  }
})

async function test() {
  const result = await generateText({
    model: openai('gpt-4o'),
    system: `You are a helpful assistant. When you search for news, you must share what you found with the user in your response. Always provide a conversational response after using tools.`,
    messages: [
      { role: 'user', content: "What's happening in tech today?" }
    ],
    tools: {
      searchNews: testSearchTool
    },
    maxSteps: 3
  })
  
  console.log('\n=== Result ===')
  console.log('Steps:', result.steps?.length)
  console.log('Text length:', result.text?.length)
  console.log('\nResponse:', result.text)
}

test().catch(console.error)