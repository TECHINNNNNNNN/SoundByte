import { PrismaClient } from '../../generated/prisma/index.js'
import { researchNews } from './perplexity.service.js'
import { formatAsDialogue } from './format.service.js'
import { generateMultiSpeakerAudio } from './multiSpeakerTTS.service.js'
import { uploadAudio } from './s3.service.js'

const prisma = new PrismaClient()

/**
 * Generate digest: Research → Format → Audio → Store
 */
export async function generateDigest(digestId) {
  const digest = await prisma.digest.findUnique({
    where: { id: digestId },
    include: { user: true }
  })
  
  if (!digest?.isActive) {
    throw new Error('Digest not found or inactive')
  }
  
  // Step 1: Research with Perplexity
  const prompt = `${digest.searchQuery}. Provide latest news and key developments from the past ${
    digest.frequency === 'daily' ? 'day' : digest.frequency === 'weekly' ? 'week' : 'month'
  }.`
  const research = await researchNews(prompt)
  
  // Step 2: Format as dialogue with OpenAI
  const dialogue = await formatAsDialogue(
    research.content,
    digest.title,
    digest.audioLength
  )
  
  // Step 3: Generate audio with Google TTS
  const audio = await generateMultiSpeakerAudio(dialogue, [
    { name: 'HOST', voice: 'Kore' },
    { name: 'GUEST', voice: 'Puck' }
  ])
  
  // Step 4: Upload to S3
  const filename = `digest-${digestId}-${Date.now()}.wav`
  const uploadResult = await uploadAudio(audio.audioContent, filename)
  const audioUrl = uploadResult.url || uploadResult // Handle both object and string returns
  
  // Step 5: Save delivery record
  const delivery = await prisma.digestDelivery.create({
    data: {
      digestId,
      audioUrl: typeof audioUrl === 'string' ? audioUrl : audioUrl.url,
      transcript: dialogue,
      searchResults: research
    }
  })
  
  // Update next generation time and last generated time
  await prisma.digest.update({
    where: { id: digestId },
    data: { 
      lastGeneratedAt: new Date(),
      nextGenerationAt: getNextGenerationTime(digest.frequency, digest.timezone, digest.preferredHour)
    }
  })
  
  return delivery
}

/**
 * Calculate next generation time
 */
function getNextGenerationTime(frequency, timezone = 'UTC', preferredHour = 8) {
  const next = new Date()
  
  switch (frequency) {
    case 'daily':
      next.setUTCDate(next.getUTCDate() + 1)
      break
    case 'weekly':
      next.setUTCDate(next.getUTCDate() + 7)
      break
    case 'monthly':
      next.setUTCMonth(next.getUTCMonth() + 1)
      next.setUTCDate(1)
      break
  }
  
  next.setUTCHours(preferredHour, 0, 0, 0)
  
  return next
}

/**
 * Process all pending digests
 */
export async function processPendingDigests() {
  const pending = await prisma.digest.findMany({
    where: {
      isActive: true,
      nextGenerationAt: { lte: new Date() }
    }
  })
  
  const results = []
  for (const digest of pending) {
    try {
      const delivery = await generateDigest(digest.id)
      results.push({ success: true, digestId: digest.id, deliveryId: delivery.id })
    } catch (error) {
      console.error(`Failed: ${digest.id}:`, error.message)
      results.push({ success: false, digestId: digest.id, error: error.message })
    }
  }
  
  return results
}