// Simple integration test without database
import dotenv from 'dotenv'
dotenv.config()

import * as multiSpeakerTTS from './src/services/multiSpeakerTTS.service.js'
import { writeFile } from 'fs/promises'

async function test() {
    console.log('🧪 Testing Multi-Speaker TTS with News Format\n')
    
    // Simulate AI-generated news dialogue
    const newsDialogue = `Host: Good morning! We have breaking news in artificial intelligence today.
Guest: That's right! OpenAI has just announced a major breakthrough in their latest model.
Host: Can you tell us more about what makes this significant?
Guest: Absolutely. This new model demonstrates unprecedented reasoning capabilities, solving complex problems that were previously thought impossible for AI.
Host: How does this compare to existing models?
Guest: It's a substantial leap forward. The model can now handle multi-step reasoning tasks with accuracy rates exceeding 90 percent.
Host: That's impressive! What are the potential applications?
Guest: We're looking at revolutionizing fields like scientific research, medical diagnosis, and educational tutoring.`

    try {
        console.log('Generating multi-speaker audio...')
        const result = await multiSpeakerTTS.generateMultiSpeakerAudio(newsDialogue, [
            { name: 'Host', voice: 'Kore' },
            { name: 'Guest', voice: 'Puck' }
        ])
        
        await writeFile('news-dialogue.wav', result.buffer)
        console.log('✅ Success! Audio saved as news-dialogue.wav')
        
        // Test single speaker for comparison
        console.log('\nGenerating single speaker version...')
        const single = await multiSpeakerTTS.generateSingleSpeakerAudio(
            'This is a single speaker news update about AI breakthroughs.'
        )
        
        await writeFile('news-single.wav', single.buffer)
        console.log('✅ Single speaker saved as news-single.wav')
        
    } catch (error) {
        console.error('❌ Error:', error.message)
    }
}

test()