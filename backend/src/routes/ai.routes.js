import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import * as aiService from '../services/ai.service.js'
import * as tokenUsage from '../services/tokenUsage.ts'

const router = express.Router()

router.post('/message', authenticateToken, async (req, res) => {
  try {
    const { conversationId, message } = req.body
    const userId = req.user.id

    if (!conversationId || !message) {
      return res.status(400).json({ error: 'Missing conversationId or message' })
    }

    const tokenCheck = await tokenUsage.checkTokensAvailable(userId, message.length)
    if (!tokenCheck.allowed) {
      return res.status(403).json({
        error: tokenCheck.message,
        remainingTokens: tokenCheck.remainingTokens
      })
    }

    const result = await aiService.processMessage(
      conversationId,
      message,
      userId
    )

    await tokenUsage.trackTokenUsage(
      userId,
      message,
      result.text,
      'chat'
    )

    return res.json({
      content: result.text,
      messageId: result.messageId,
      audioUrl: result.audioUrl,
      usedSearchTool: result.usedSearchTool,
      remainingTokens: await tokenUsage.getUsageStats(userId).then(stats => stats.remaining)
    })

  } catch (error) {
    console.error('AI route error:', error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/usage', authenticateToken, async (req, res) => {
  try {
    const stats = await tokenUsage.getUsageStats(req.user.id)
    res.json(stats)
  } catch (error) {
    console.error('Usage stats error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router