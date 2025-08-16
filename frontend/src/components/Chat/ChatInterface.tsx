import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import conversationService, { type Conversation, type Message } from '../../services/conversation.service'
import MessageList from './MessageList'
import MessageInput from './MessageInput'

const ChatInterface = () => {
    const { conversationId } = useParams<{ conversationId: string }>()
    const [conversation, setConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)


    useEffect(() => {
        if (conversationId) {
            loadConversation()
        }
    }, [conversationId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const loadConversation = async () => {
        if (!conversationId) return

        try {
            setLoading(true)
            const data = await conversationService.getConversation(conversationId)
            setConversation(data)
            setMessages(data.messages || [])
        } catch (error) {
            console.error('Failed to load conversation:', error)
        } finally {
            setLoading(false)
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleSendMessage = async (content: string) => {
        if (!conversationId || content.trim() === '' || sending) return

        try {
            setSending(true)

            // Add user message
            const userMessage = await conversationService.addMessage(conversationId, content, 'user')
            setMessages(prev => [...prev, userMessage])
            // TODO: In the future, this is where we'll call the AI agent
            // For now, just add a placeholder response
            setTimeout(async () => {
                const assistantMessage = await conversationService.addMessage(
                    conversationId,
                    "I'll help you research that news topic and generate an audio summary. (This is a placeholder - AI integration coming next!)",
                    'assistant'
                )
                setMessages(prev => [...prev, assistantMessage])
            }, 1000)
        } catch (error) {
            console.error('Failed to send message:', error)
        } finally {
            setSending(false)
        }
    }

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-gray-500">Loading conversation...</div>
            </div>
        )
    }

    if (!conversation) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                        Welcome to SoundByte
                    </h2>
                    <p className="text-gray-500">
                        Select a conversation or create a new one to get started
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            {/* Chat Header */}
            <div className="bg-white border-b px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-800">
                    {conversation.title}
                </h2>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto">
                <MessageList messages={messages} />
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t bg-white">
                <MessageInput
                    onSendMessage={handleSendMessage}
                    disabled={sending}
                    placeholder={sending ? "Sending..." : "Ask about any news topic..."}
                />
            </div>
        </div>
    )
}

export default ChatInterface