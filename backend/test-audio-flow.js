import { processMessage } from './src/services/ai.service.js'
import { PrismaClient } from './generated/prisma/index.js'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function test() {
  console.log('\n=== Testing Audio Confirmation Flow ===\n')
  
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
      title: 'Audio Flow Test'
    }
  })
  
  console.log('Test 1: Ask for news (should offer audio, not generate it)')
  console.log('User: "What\'s happening in tech today?"')
  
  const response1 = await processMessage(
    conversation.id, 
    "What's happening in tech today?", 
    user.id
  )
  
  console.log('\nAssistant:', response1.text)
  console.log('News searched:', response1.usedSearchTool ? 'Yes' : 'No')
  console.log('Audio generated:', response1.audioGenerated ? 'Yes' : 'No')
  console.log('Audio URL:', response1.audioUrl || 'None')
  
  console.log('\n-------------------\n')
  
  console.log('Test 2: Confirm audio generation')
  console.log('User: "Yes, please create the audio!"')
  
  const response2 = await processMessage(
    conversation.id,
    "Yes, please create the audio!",
    user.id
  )
  
  console.log('\nAssistant:', response2.text)
  console.log('Audio generated:', response2.audioGenerated ? 'Yes' : 'No')
  console.log('Audio URL:', response2.audioUrl || 'None')
  
  console.log('\n=== Test Complete ===\n')
  process.exit(0)
}

test().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})