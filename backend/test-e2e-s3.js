// Full end-to-end test with S3 upload
import dotenv from 'dotenv'
dotenv.config()

import * as multiSpeakerTTS from './src/services/multiSpeakerTTS.service.js'
import * as s3Service from './src/services/s3.service.js'

async function testEndToEnd() {
    console.log('🚀 Full End-to-End Test: Multi-Speaker TTS → S3\n')
    
    // Simulate news dialogue from AI
    const newsDialogue = `Host: Welcome to SoundByte! Today we're discussing the latest in AI technology.
Guest: Thanks for having me! The developments in AI this week have been absolutely groundbreaking.
Host: What's the most significant breakthrough you've seen?
Guest: Google's new Gemini models now support multi-speaker audio generation, creating natural conversations like this one!`

    try {
        // Step 1: Generate multi-speaker audio
        console.log('1️⃣ Generating multi-speaker audio...')
        const ttsResult = await multiSpeakerTTS.generateMultiSpeakerAudio(newsDialogue, [
            { name: 'Host', voice: 'Kore' },
            { name: 'Guest', voice: 'Puck' }
        ])
        console.log('   ✅ Audio generated successfully')
        console.log('   Size:', (ttsResult.buffer.length / 1024).toFixed(2), 'KB')
        
        // Step 2: Upload to S3
        console.log('\n2️⃣ Uploading to S3...')
        const messageId = `test-msg-${Date.now()}`
        const s3Result = await s3Service.uploadAudio(ttsResult.buffer, messageId)
        console.log('   ✅ Uploaded to S3')
        console.log('   URL:', s3Result.url)
        console.log('   Key:', s3Result.key)
        
        // Step 3: Verify the URL is accessible
        console.log('\n3️⃣ Verifying S3 URL...')
        const response = await fetch(s3Result.url, { method: 'HEAD' })
        if (response.ok) {
            console.log('   ✅ URL is accessible!')
            console.log('   Content-Type:', response.headers.get('content-type'))
            console.log('   Content-Length:', response.headers.get('content-length'))
        } else {
            console.log('   ⚠️ URL returned status:', response.status)
        }
        
        console.log('\n🎉 End-to-End Test Complete!')
        console.log('Audio URL:', s3Result.url)
        
    } catch (error) {
        console.error('❌ Test failed:', error.message)
        console.error('Details:', error)
    }
}

testEndToEnd()