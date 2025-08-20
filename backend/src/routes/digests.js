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
    const { title, searchQuery, frequency, audioLength, deliveryEmail, useDefaultEmail } = req.body;

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

    // Check email availability
    const email = useDefaultEmail ? req.user.email : deliveryEmail;
    if (!email) {
      return res.status(400).json({ error: 'Email required. Please provide an email or enable default email.' });
    }

    // Calculate next generation time
    const nextGenerationAt = calculateNextGeneration(frequency);

    const digest = await prisma.digest.create({
      data: {
        userId: req.user.id,
        title,
        searchQuery,
        frequency,
        audioLength,
        deliveryEmail: useDefaultEmail ? null : deliveryEmail,
        useDefaultEmail,
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
function calculateNextGeneration(frequency) {
  const now = new Date();
  const next = new Date(now);

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      next.setHours(8, 0, 0, 0); // 8 AM
      break;
    case 'weekly':
      next.setDate(next.getDate() + (7 - next.getDay() + 1) % 7 || 7); // Next Monday
      next.setHours(8, 0, 0, 0);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      next.setDate(1);
      next.setHours(8, 0, 0, 0);
      break;
  }

  return next;
}

export default router;