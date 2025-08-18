// Simple route to test our AI service

import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import * as aiService from '../services/ai.service.js'

const router = express.Router()

/**
 * POST /api/ai/message
 * Send a message and get AI response
 */
router.post('/message', authenticateToken, async (req, res) => {
  try {
    const { conversationId, message } = req.body
    
    if (!conversationId || !message) {
      return res.status(400).json({ error: 'Missing conversationId or message' })
    }

    const result = await aiService.processMessage(
      conversationId,
      message,
      req.user.id
    )

    // Return the response as JSON
    return res.json({
      content: result.text,
      messageId: result.messageId,
      audioUrl: result.audioUrl,
      usedSearchTool: result.usedSearchTool
    })

  } catch (error) {
    console.error('AI route error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router