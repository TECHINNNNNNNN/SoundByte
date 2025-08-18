// Test our service directly
import dotenv from 'dotenv'
dotenv.config()

import { generateMultiSpeakerAudio } from './src/services/multiSpeakerTTS.service.js'
import { writeFile } from 'fs/promises'

const dialogue = `Joe: Hello Jane!
Jane: Hi Joe!`

async function test() {
    try {
        console.log('API Key:', process.env.GOOGLE_API_KEY)
        const result = await generateMultiSpeakerAudio(dialogue, [
            { name: 'Joe', voice: 'Kore' },
            { name: 'Jane', voice: 'Puck' }
        ])
        
        await writeFile('service-test.wav', result.buffer)
        console.log('✅ Success!')
    } catch (error) {
        console.error('❌ Error:', error.message)
    }
}

test()