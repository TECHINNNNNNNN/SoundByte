import express from 'express'
import { PrismaClient } from "../../generated/prisma/index.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()
const prisma = new PrismaClient()


// Get all conversations for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const conversations = await prisma.conversation.findMany({
            where: {
                userId: req.user.id
            },
            orderBy: {
                updatedAt: 'desc'
            },
            include: {
                messages: {
                    take: 1,
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        })

        res.json(conversations)
    } catch (error) {
        console.error('Error fetching conversations:', error)
        res.status(500).json({ error: 'Failed to fetch conversations' })
    }
})

// create new conversation
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title } = req.body

        if (!title || title.trim() === '') {
            return res.status(400).json({ error: 'Title is required' })
        }

        const newConversation = await prisma.conversation.create({
            data: {
                title: title.trim(),
                userId: req.user.id
            },
            include: {
                messages: true
            }
        })
        res.status(201).json(newConversation)
    } catch (error) {
        console.error('Error creating conversation:', error)
        res.status(500).json({ error: 'Failed to create conversation' })
    }
})

// Get a single conversation with messages
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params

        const conversation = await prisma.conversation.findFirst({
            where: {
                id,
                userId: req.user.id
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            }
        })

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation for this user and id not found' })
        }

        res.json(conversation)
    } catch (error) {
        console.error('Error fetching conversation:', error)
        res.status(500).json({ error: 'Failed to fetch conversation' })
    }
})


// Update a conversation title
router.patch('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params
        const { title } = req.body

        if (!title || title.trim() === '') {
            return res.status(400).json({ error: 'To update title is required' })
        }

        // check if conversation belongs to user
        const existing = await prisma.conversation.findFirst({
            where: {
                id,
                userId: req.user.id
            }
        })

        if (!existing) {
            return res.status(404).json({ error: 'Conversation not found for this user and id' })
        }

        const updatedConversation = await prisma.conversation.update({
            where: {
                id,
            },
            data: {
                title: title.trim()
            }
        })

        res.json(updatedConversation)
    } catch (error) {
        console.error('Error updating conversation title:', error)
        res.status(500).json({ error: 'Failed to update conversation title' })
    }
})

// Delete a conversation
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params
        // check if conversation belongs to this user
        const existing = await prisma.conversation.findFirst({
            where: {
                id,
                userId: req.user.id
            }
        })

        if (!existing) {
            return res.status(404).json({ message: 'Conversation not found for this user and id to delete' })
        }

        await prisma.conversation.delete({
            where: { id }
        })

        res.status(204).send()
    } catch (error) {
        console.error('Error deleting conversation:', error)
        res.status(500).json({ error: 'Failed to delete conversation' })
    }
})

export default router