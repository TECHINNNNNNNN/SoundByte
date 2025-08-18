// Test multi-speaker TTS
import dotenv from 'dotenv'
import { generateMultiSpeakerAudio, generateSingleSpeakerAudio } from './src/services/multiSpeakerTTS.service.js'
import { writeFile } from 'fs/promises'

dotenv.config()

const dialogue = `Host: Welcome to today's tech news podcast! We have some exciting developments in AI.
Guest: Yes, the new Gemini models are really pushing the boundaries of what's possible.
Host: Can you tell us more about the multi-speaker capabilities?
Guest: Absolutely! It can now generate natural conversations with different voices, making content more engaging.`

async function test() {
    try {
        console.log('Testing multi-speaker audio...')
        const result = await generateMultiSpeakerAudio(dialogue)
        
        await writeFile(`test-multi-speaker.${result.format}`, result.buffer)
        console.log(`✅ Multi-speaker audio saved as test-multi-speaker.${result.format}`)
        
        console.log('\nTesting single speaker audio...')
        const single = await generateSingleSpeakerAudio('This is a test of single speaker audio.')
        
        await writeFile(`test-single-speaker.${single.format}`, single.buffer)
        console.log(`✅ Single speaker audio saved as test-single-speaker.${single.format}`)
        
    } catch (error) {
        console.error('❌ Error:', error.message)
    }
}

test()