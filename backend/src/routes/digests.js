import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { PrismaClient } from "../../generated/prisma/index.js"

const router = express.Router();
const prisma = new PrismaClient()

// Get all user digests
router.get('/', authenticateToken, async (req, res) => {
  try {
    const digests = await prisma.digest.findMany({
      where: { userId: req.user.id },
      include: {
        _count: { select: { deliveries: true } },
        deliveries: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(digests);
  } catch (error) {
    console.error('Get digests error:', error);
    res.status(500).json({ error: 'Failed to fetch digests' });
  }
});

// Create new digest
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, searchQuery, frequency, audioLength, deliveryEmail, useDefaultEmail, timezone, preferredHour } = req.body;

    // Validate required fields
    if (!title || !searchQuery || !frequency || !audioLength) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate audio length
    if (![2, 5, 10].includes(audioLength)) {
      return res.status(400).json({ error: 'Audio length must be 2, 5, or 10 minutes' });
    }

    // Validate frequency
    if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
      return res.status(400).json({ error: 'Invalid frequency' });
    }

    // Validate preferred hour
    const hour = preferredHour || 8;
    if (hour < 0 || hour > 23) {
      return res.status(400).json({ error: 'Preferred hour must be between 0-23' });
    }

    // Check email availability
    const email = useDefaultEmail ? req.user.email : deliveryEmail;
    if (!email) {
      return res.status(400).json({ error: 'Email required. Please provide an email or enable default email.' });
    }

    // Calculate next generation time with timezone
    const tz = timezone || 'UTC';
    const nextGenerationAt = calculateNextGeneration(frequency, tz, hour);

    const digest = await prisma.digest.create({
      data: {
        userId: req.user.id,
        title,
        searchQuery,
        frequency,
        audioLength,
        deliveryEmail: useDefaultEmail ? null : deliveryEmail,
        useDefaultEmail,
        timezone: tz,
        preferredHour: hour,
        nextGenerationAt
      }
    });

    res.status(201).json(digest);
  } catch (error) {
    console.error('Create digest error:', error);
    res.status(500).json({ error: 'Failed to create digest' });
  }
});

// Update digest
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const digest = await prisma.digest.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!digest) {
      return res.status(404).json({ error: 'Digest not found' });
    }

    const updates = {};
    const fields = ['title', 'searchQuery', 'frequency', 'audioLength', 'deliveryEmail', 'useDefaultEmail', 'isActive'];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Recalculate next generation if frequency changed
    if (updates.frequency) {
      updates.nextGenerationAt = calculateNextGeneration(updates.frequency);
    }

    const updated = await prisma.digest.update({
      where: { id: req.params.id },
      data: updates
    });

    res.json(updated);
  } catch (error) {
    console.error('Update digest error:', error);
    res.status(500).json({ error: 'Failed to update digest' });
  }
});

// Generate digest manually (for testing)
router.post('/:id/generate', authenticateToken, async (req, res) => {
  try {
    const digest = await prisma.digest.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });
    
    if (!digest) {
      return res.status(404).json({ error: 'Digest not found' });
    }
    
    // Import dynamically to avoid circular dependencies
    const { generateDigest } = await import('../services/digest.service.js');
    const delivery = await generateDigest(digest.id);
    
    res.json({ 
      message: 'Digest generated successfully',
      audioUrl: delivery.audioUrl,
      deliveryId: delivery.id 
    });
  } catch (error) {
    console.error('Generate digest error:', error);
    res.status(500).json({ error: 'Failed to generate digest: ' + error.message });
  }
});

// Test email sending (for testing)
router.post('/test-email', authenticateToken, async (req, res) => {
  try {
    const { sendDigestEmail } = await import('../services/email.service.js');
    
    // Create test data
    const testDigest = {
      id: 'test-123',
      title: 'Test Email - AI News Daily',
      transcript: `Two tech experts discussing AI in a modern studio.
HOST: Welcome to today's AI digest test!
GUEST: Thanks for having me. This is a test email to verify our email system is working.
HOST: Everything looks great. The email delivery is functioning perfectly.
GUEST: Indeed! Your audio digest system is ready to go.`
    };
    
    const testAudioUrl = 'https://soundbyte-audio-news.s3.ap-southeast-2.amazonaws.com/test-audio.wav';
    
    // Send to user's email
    await sendDigestEmail(req.user.email, testDigest, testAudioUrl);
    
    res.json({ 
      message: 'Test email sent successfully',
      to: req.user.email 
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Failed to send test email: ' + error.message });
  }
});

// Trigger scheduler manually (for testing)
router.post('/trigger-scheduler', authenticateToken, async (req, res) => {
  try {
    const { triggerDigests } = await import('../services/scheduler.service.js');
    const results = await triggerDigests();
    
    res.json({ 
      message: 'Scheduler triggered',
      processed: results.length,
      results: results
    });
  } catch (error) {
    console.error('Trigger scheduler error:', error);
    res.status(500).json({ error: 'Failed to trigger scheduler' });
  }
});

// Delete digest
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const digest = await prisma.digest.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!digest) {
      return res.status(404).json({ error: 'Digest not found' });
    }

    await prisma.digest.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Digest deleted successfully' });
  } catch (error) {
    console.error('Delete digest error:', error);
    res.status(500).json({ error: 'Failed to delete digest' });
  }
});

// Helper function to calculate next generation time  
// For MVP: Store everything in UTC, handle timezone conversion on frontend
function calculateNextGeneration(frequency, timezone = 'UTC', preferredHour = 8) {
  const now = new Date();
  const next = new Date(now);

  switch (frequency) {
    case 'daily':
      next.setUTCDate(next.getUTCDate() + 1);
      break;
    case 'weekly':
      next.setUTCDate(next.getUTCDate() + 7);
      break;
    case 'monthly':
      next.setUTCMonth(next.getUTCMonth() + 1);
      next.setUTCDate(1);
      break;
  }

  // Set to preferred hour (simplified for MVP)
  // TODO: In future, use moment-timezone for accurate timezone conversion
  next.setUTCHours(preferredHour, 0, 0, 0);

  return next;
}

export default router;