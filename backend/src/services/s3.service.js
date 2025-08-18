// S3 Upload Service - AWS S3
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import dotenv from 'dotenv'

dotenv.config()

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

/**
 * Upload audio to S3 and return URL
 * @param {Buffer} audioBuffer - Audio data
 * @param {string} messageId - Message ID
 * @param {string} format - Audio format ('wav' or 'mp3'), defaults to 'wav'
 */
export const uploadAudio = async (audioBuffer, messageId, format = 'wav') => {
  try {
    const extension = format === 'mp3' ? 'mp3' : 'wav'
    const contentType = format === 'mp3' ? 'audio/mpeg' : 'audio/wav'
    const key = `audio/${messageId}.${extension}`
    
    console.log(`📤 Uploading ${extension.toUpperCase()} to S3:`, key)
    
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: audioBuffer,
      ContentType: contentType,
      CacheControl: 'max-age=31536000' // Cache for 1 year
    })
    
    await s3Client.send(command)
    
    // Return public URL
    const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    
    return {
      url,
      key,
      size: audioBuffer.length
    }
    
  } catch (error) {
    console.error('S3 upload error:', error)
    throw new Error(`Failed to upload audio: ${error.message}`)
  }
}