// Text-to-Speech Service - Google Cloud TTS
import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import dotenv from 'dotenv'

dotenv.config()

const client = new TextToSpeechClient()

/**
 * Generate audio from text using Google TTS
 */
export const generateAudio = async (text) => {
  try {
    const request = {
      input: { text },
      voice: {
        languageCode: 'en-US',
        name: 'en-US-Journey-D',
        ssmlGender: 'MALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0,
        volumeGainDb: 0
      }
    }

    const [response] = await client.synthesizeSpeech(request)

    return {
      audioContent: response.audioContent, // Base64 encoded audio
      format: 'mp3',
      duration: estimateDuration(text) // Rough estimate
    }

  } catch (error) {
    console.error('TTS error:', error)
    throw new Error(`Failed to generate audio: ${error.message}`)
  }
}

/**
 * Estimate audio duration based on text length
 * Average speaking rate: ~150 words per minute
 */
const estimateDuration = (text) => {
  const words = text.split(/\s+/).length
  const minutes = words / 150
  const seconds = Math.round(minutes * 60)
  return seconds
}