// Test AI service with multi-speaker TTS
import dotenv from 'dotenv'
dotenv.config()

import { processMessage } from './src/services/ai.service.js'

async function test() {
    console.log('🧪 Testing AI + Multi-Speaker TTS Integration\n')
    
    // Mock IDs for testing
    const conversationId = 'test-conv-123'
    const userId = 'test-user-456'
    
    try {
        // Test news request (should trigger multi-speaker)
        console.log('Testing news request...')
        const result = await processMessage(
            conversationId,
            "What's the latest news about AI?",
            userId
        )
        
        console.log('✅ Integration test complete!')
        console.log('Result:', result)
        
    } catch (error) {
        console.error('❌ Test failed:', error.message)
        console.log('\nNote: This test requires database connection.')
        console.log('For isolated testing, use test-multi-speaker.js')
    }
}

test()