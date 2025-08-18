import dotenv from 'dotenv'
dotenv.config()

// Import AFTER dotenv to ensure env vars are loaded
const { GoogleGenAI } = await import('@google/genai')
const { writeFile } = await import('fs/promises')

const ai = new GoogleGenAI({})

const dialogue = `TTS the following conversation between Joe and Jane:
Joe: How's it going today Jane?
Jane: Not too bad, how about you?`

async function test() {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text: dialogue }] }],
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
        const audioBuffer = Buffer.from(data, 'base64')
        
        await writeFile('final-test.wav', audioBuffer)
        console.log('✅ Success!')
    } catch (error) {
        console.error('❌ Error:', error.message)
    }
}

test()