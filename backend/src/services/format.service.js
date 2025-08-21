import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

/**
 * Format news content into engaging multi-speaker dialogue
 */
export async function formatAsDialogue(content, topic, audioLength = 5) {
  const wordCount = audioLength * 150 // ~150 words/minute
  
  const systemPrompt = `You are a dialogue formatter for audio podcasts.
Convert news content into natural HOST/GUEST conversation.

Format rules:
1. Start with context line (e.g., "Two tech experts discussing in a modern studio")
2. Use "HOST:" and "GUEST:" labels
3. Keep dialogue natural and engaging
4. Target ${wordCount} words total
5. Host asks questions, Guest provides insights
6. End with a brief wrap-up

Example:
Two tech experts discussing AI breakthroughs in a modern studio.
HOST: Welcome to today's tech digest. What's the latest in ${topic}?
GUEST: Thanks for having me! There have been some fascinating developments...
HOST: Can you elaborate on that?
GUEST: Absolutely! [detailed explanation]
HOST: That's incredible. What should our listeners watch for next?
GUEST: I'd say keep an eye on...
HOST: Great insights. Thanks for joining us today.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Smaller, faster, cheaper
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Convert this ${topic} news into dialogue:\n\n${content}` }
      ],
      temperature: 0.7,
      max_tokens: Math.min(wordCount * 2, 1500) // Buffer for formatting
    })
    
    return completion.choices[0].message.content
  } catch (error) {
    console.error('Formatting error:', error)
    // Fallback to simple format
    return `Two speakers discussing ${topic}.
HOST: Welcome to today's ${topic} digest.
GUEST: ${content}
HOST: Thanks for that update. Until next time!`
  }
}