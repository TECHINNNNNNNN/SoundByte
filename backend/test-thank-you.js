import { processMessage } from './src/services/ai.service.js'
import { PrismaClient } from './generated/prisma/index.js'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function testThankYouScenario() {
  console.log('\n=== Testing "Thank You" Scenario ===\n')
  
  // Setup test user
  let user = await prisma.user.findFirst({
    where: { email: 'test@soundbyte.ai' }
  })
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'test@soundbyte.ai',
        password: 'test123',
        name: 'Test User'
      }
    })
  }
  
  // Create conversation
  const conversation = await prisma.conversation.create({
    data: {
      userId: user.id,
      title: 'Thank You Test'
    }
  })
  
  // Test sequence
  console.log('Step 1: Ask for news')
  console.log('User: "What\'s happening in AI today?"')
  
  const response1 = await processMessage(
    conversation.id,
    "What's happening in AI today?",
    user.id
  )
  
  console.log('\nAssistant response (truncated):', response1.text.substring(0, 200) + '...')
  console.log('Audio offered:', response1.text.includes('audio') ? 'Yes' : 'No')
  
  console.log('\n-------------------\n')
  
  console.log('Step 2: Say thank you (should NOT generate audio)')
  console.log('User: "Thank you!"')
  
  const response2 = await processMessage(
    conversation.id,
    "Thank you!",
    user.id
  )
  
  console.log('\nAssistant:', response2.text)
  console.log('Audio generated:', response2.audioGenerated ? '❌ FAIL - Generated audio' : '✅ PASS - No audio')
  
  console.log('\n-------------------\n')
  
  console.log('Step 3: Now explicitly request audio')
  console.log('User: "Actually, yes please create the audio for the AI news"')
  
  const response3 = await processMessage(
    conversation.id,
    "Actually, yes please create the audio for the AI news",
    user.id
  )
  
  console.log('\nAssistant:', response3.text)
  console.log('Audio generated:', response3.audioGenerated ? '✅ PASS - Generated audio' : '❌ FAIL - No audio')
  
  console.log('\n=== Test Complete ===\n')
  process.exit(0)
}

testThankYouScenario().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})