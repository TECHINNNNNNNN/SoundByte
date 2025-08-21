import { GoogleGenAI } from '@google/genai'
import wav from 'wav'

let ai = null

function getAI() {
    if (!ai) {
        ai = new GoogleGenAI({})
    }
    return ai
}

/**
 * Convert PCM data to WAV format
 */
async function pcmToWav(pcmData, channels = 1, sampleRate = 24000, bitDepth = 16) {
    return new Promise((resolve, reject) => {
        const chunks = []
        
        // Create WAV writer with proper format
        const writer = new wav.Writer({
            channels: channels,
            sampleRate: sampleRate,
            bitDepth: bitDepth
        })
        
        writer.on('data', chunk => chunks.push(chunk))
        writer.on('end', () => resolve(Buffer.concat(chunks)))
        writer.on('error', reject)
        
        // Write PCM data and end stream
        writer.write(pcmData)
        writer.end()
    })
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
    if (!data) throw new Error('No audio generated')
    
    // Convert base64 to PCM buffer
    const pcmBuffer = Buffer.from(data, 'base64')
    console.log('🔊 PCM data size:', (pcmBuffer.length / 1024).toFixed(2), 'KB')
    
    // Convert PCM to proper WAV format
    const wavBuffer = await pcmToWav(pcmBuffer)
    console.log('✅ WAV file generated:', (wavBuffer.length / 1024).toFixed(2), 'KB')
    
    return {
        audioContent: wavBuffer.toString('base64'),
        buffer: wavBuffer,
        format: 'wav'
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
    if (!data) throw new Error('No audio generated')
    
    // Convert base64 to PCM buffer
    const pcmBuffer = Buffer.from(data, 'base64')
    console.log('🔊 PCM data size:', (pcmBuffer.length / 1024).toFixed(2), 'KB')
    
    // Convert PCM to proper WAV format
    const wavBuffer = await pcmToWav(pcmBuffer)
    console.log('✅ WAV file generated:', (wavBuffer.length / 1024).toFixed(2), 'KB')
    
    return {
        audioContent: wavBuffer.toString('base64'),
        buffer: wavBuffer,
        format: 'wav'
    }
}