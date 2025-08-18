// Debug multi-speaker TTS
import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai'
import { writeFile } from 'fs/promises'

dotenv.config()

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
})

async function test() {
    // Exact structure from Google's documentation
    const prompt = `TTS the following conversation between Joe and Jane:
Joe: How's it going today Jane?
Jane: Not too bad, how about you?`

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    multiSpeakerVoiceConfig: {
                        speakerVoiceConfigs: [
                            {
                                speaker: 'Joe',
                                voiceConfig: {
                                    prebuiltVoiceConfig: { voiceName: 'Kore' }
                                }
                            },
                            {
                                speaker: 'Jane',
                                voiceConfig: {
                                    prebuiltVoiceConfig: { voiceName: 'Puck' }
                                }
                            }
                        ]
                    }
                }
            }
        })

        const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data
        if (data) {
            const buffer = Buffer.from(data, 'base64')
            await writeFile('multi-speaker-test.wav', buffer)
            console.log('✅ Success! Audio saved to multi-speaker-test.wav')
        } else {
            console.log('❌ No audio data returned')
        }
    } catch (error) {
        console.error('❌ Error:', error.message)
    }
}

test()