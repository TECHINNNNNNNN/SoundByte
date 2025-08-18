// Test if GEMINI_API_KEY works for basic text generation
import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai'

dotenv.config()

async function testBasicAPI() {
    console.log('Testing Gemini API key...')
    
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
    })
    
    try {
        // Test basic text generation
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [{ parts: [{ text: 'Say hello' }] }]
        })
        
        console.log('✅ Basic text generation works:', response.candidates?.[0]?.content?.parts?.[0]?.text)
        
        // Test TTS model
        console.log('\nTesting TTS model...')
        const ttsResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text: 'Hello world' }] }],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }
                    }
                }
            }
        })
        
        const audioData = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data
        if (audioData) {
            console.log('✅ TTS model works! Audio data received')
        } else {
            console.log('❌ TTS model did not return audio')
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message)
        if (error.message.includes('ACCESS_TOKEN_SCOPE_INSUFFICIENT')) {
            console.log('\n⚠️  Your API key doesn\'t have TTS permissions enabled')
            console.log('Please check: https://aistudio.google.com/apikey')
            console.log('You may need to enable TTS/Audio generation for your API key')
        }
    }
}

testBasicAPI()