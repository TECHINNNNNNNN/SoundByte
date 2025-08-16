import express from 'express'
import { PrismaClient } from "../../generated/prisma/index.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()
const prisma = new PrismaClient()

// add a message to a conversation
router.post('/:conversationId/messages', authenticateToken, async (req, res) => {
    try {
        const { conversationId } = req.params
        const { content, role = 'user' } = req.body

        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Content is required' })
        }

        // verify conversation belongs to user
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userId: req.user.id
            }
        })

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found of this user and id' })
        }

        // create the message
        const message = await prisma.message.create({
            data: {
                conversationId,
                content: content.trim(),
                role,
                metadata: {}
            }
        })

        // update conversation's updatedAt timestamp
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        })

        res.status(201).json(message)
    } catch (error) {
        console.error('Error creating message:', error)
        res.status(500).json({ error: 'Failed to create message' })
    }
})

// Get messages for a conversation (with pagination)
router.get('/:conversationId/messages', authenticateToken, async (req, res) => {
    try {
        const { conversationId } = req.params
        const { limit = 50, cursor } = req.query


        // verify conversation belongs to user
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userId: req.user.id
            }
        })

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found of this user and id' })
        }

        // Build the query
        const queryOptions = {
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit)
        }

        // Add cursor for pagination if provided
        if (cursor) {
            queryOptions.cursor = { id: cursor },
                queryOptions.skip = 1
        }

        const messages = await prisma.message.findMany(queryOptions)

        // Reverse to get chronological order
        messages.reverse()

        res.json({
            messages,
            hasMore: messages.length === parseInt(limit),
            nextCursor: messages.length > 0 ? messages[0].id : null
        })
    } catch (error) {
        console.error('Error fetching messages:', error)
        res.status(500).json({ error: 'Failed to fetch messages' })
    }
})

// Update a message (mainly for adding audio URL after generation)
router.patch('/:conversationId/messages/:messageId', authenticateToken, async (req, res) => {
    try {
        const { conversationId, messageId } = req.params
        const { audioUrl, audioDuration, metadata } = req.body

        // verify conversation belongs to user
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userId: req.user.id
            }
        })

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found of this user and id in audio url generation update' })
        }

        // verify message exists in this conversation
        const existingMessage = await prisma.message.findFirst({
            where: {
                id: messageId,
                conversationId
            }
        })

        if (!existingMessage) {
            return res.status(404).json({ error: 'Message not found in this conversation' })
        }

        // update the message
        const updateData = {}
        if (audioUrl !== undefined) updateData.audioUrl = audioUrl
        if (audioDuration !== undefined) updateData.audioDuration = audioDuration
        if (metadata !== undefined) updateData.metadata = metadata

        const message = await prisma.message.update({
            where: { id: messageId },
            data: updateData
        })

        res.json(message)
    } catch (error) {
        console.error('Error updating message from audio url generation:', error)
        res.status(500).json({ error: 'Failed to update message from audio url generation' })
    }
})


// Delete a message
router.delete('/:conversationId/messages/:messageId', authenticateToken, async (req, res) => {
    try {
        const { conversationId, messageId } = req.params

        // Verify conversation belongs to user
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userId: req.user.id
            }
        })

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' })
        }

        // Verify message exists in this conversation
        const existingMessage = await prisma.message.findFirst({
            where: {
                id: messageId,
                conversationId
            }
        })

        if (!existingMessage) {
            return res.status(404).json({ error: 'Message not found' })
        }

        // Delete the message
        await prisma.message.delete({
            where: { id: messageId }
        })

        res.status(204).send()
    } catch (error) {
        console.error('Error deleting message:', error)
        res.status(500).json({ error: 'Failed to delete message' })
    }
})

export default router