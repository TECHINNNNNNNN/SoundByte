import { GoogleGenAI } from '@google/genai'

let ai = null

function getAI() {
    if (!ai) {
        ai = new GoogleGenAI({})
    }
    return ai
}

export async function generateMultiSpeakerAudio(text, speakers = null) {
    const defaultSpeakers = [
        { name: 'Joe', voice: 'Kore' },
        { name: 'Jane', voice: 'Puck' }
    ]
    
    const speakerConfig = speakers || defaultSpeakers
    console.log('🎭 Multi-speaker TTS:', speakerConfig.map(s => `${s.name}(${s.voice})`).join(', '))
    console.log('📝 Text length:', text.length, 'chars')
    
    const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                multiSpeakerVoiceConfig: {
                    speakerVoiceConfigs: speakerConfig.map(s => ({
                        speaker: s.name,
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: s.voice }
                        }
                    }))
                }
            }
        }
    })

    const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data
    const audioBuffer = Buffer.from(data, 'base64')
    console.log('✅ Multi-speaker audio generated:', (audioBuffer.length / 1024).toFixed(2), 'KB')
    
    return {
        audioContent: data,
        buffer: audioBuffer
    }
}

export async function generateSingleSpeakerAudio(text, voice = 'Kore') {
    console.log('🎤 Single speaker TTS:', voice)
    console.log('📝 Text length:', text.length, 'chars')
    
    const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voice }
                }
            }
        }
    })

    const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data
    const audioBuffer = Buffer.from(data, 'base64')
    console.log('✅ Single speaker audio generated:', (audioBuffer.length / 1024).toFixed(2), 'KB')
    
    return {
        audioContent: data,
        buffer: audioBuffer
    }
}