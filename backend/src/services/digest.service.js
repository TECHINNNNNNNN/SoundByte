import { PrismaClient } from '../../generated/prisma/index.js'
import { researchNews } from './perplexity.service.js'
import { formatAsDialogue } from './format.service.js'
import { generateMultiSpeakerAudio } from './multiSpeakerTTS.service.js'
import { uploadAudio } from './s3.service.js'
import { sendDigestEmail } from './email.service.js'

const prisma = new PrismaClient()

// basically: research -> format -> audio -> store
export async function generateDigest(digestId) {
  const digest = await prisma.digest.findUnique({
    where: { id: digestId },
    include: { user: true }
  })
  
  if (!digest?.isActive) {
    throw new Error('Digest not found or inactive')
  }
  
  const prompt = `${digest.searchQuery}. Provide latest news and key developments from the past ${
    digest.frequency === 'daily' ? 'day' : digest.frequency === 'weekly' ? 'week' : 'month'
  }.`
  const research = await researchNews(prompt)
  
  const dialogue = await formatAsDialogue(
    research.content,
    digest.title,
    digest.audioLength
  )
  
  const audio = await generateMultiSpeakerAudio(dialogue, [
    { name: 'HOST', voice: 'Kore' },
    { name: 'GUEST', voice: 'Puck' }
  ])
  
  const filename = `digest-${digestId}-${Date.now()}`
  const audioBuffer = Buffer.from(audio.audioContent, 'base64')
  const uploadResult = await uploadAudio(audioBuffer, filename, 'wav')
  const audioUrl = uploadResult.url || uploadResult // Handle both object and string returns
  
  const delivery = await prisma.digestDelivery.create({
    data: {
      digestId,
      audioUrl: typeof audioUrl === 'string' ? audioUrl : audioUrl.url,
      transcript: dialogue,
      searchResults: research
    }
  })
  
  try {
    const recipientEmail = digest.useDefaultEmail ? digest.user.email : digest.deliveryEmail
    if (recipientEmail) {
      await sendDigestEmail(recipientEmail, {
        id: digestId,
        title: digest.title,
        transcript: dialogue
      }, audioUrl)
      
      await prisma.digestDelivery.update({
        where: { id: delivery.id },
        data: { 
          delivered: true,
          deliveredAt: new Date()
        }
      })
    }
  } catch (emailError) {
    console.error('Email delivery failed:', emailError.message)
    // email failed but whatever
  }
  
  await prisma.digest.update({
    where: { id: digestId },
    data: { 
      lastGeneratedAt: new Date(),
      nextGenerationAt: getNextGenerationTime(digest.frequency, digest.timezone, digest.preferredHour)
    }
  })
  
  return delivery
}

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