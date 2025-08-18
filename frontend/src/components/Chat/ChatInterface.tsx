import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import conversationService, { type Conversation, type Message } from '../../services/conversation.service'
import aiService from '../../services/ai.service'
import MessageList from './MessageList'
import MessageInput from './MessageInput'

const ChatInterface = () => {
    const { conversationId } = useParams<{ conversationId: string }>()
    const [conversation, setConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)
    const [sending, setSending] = useState(false)
    const [aiStatus, setAiStatus] = useState<string>('')
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
            
            // Show AI is working
            const isNewsQuery = content.toLowerCase().includes('news') || 
                               content.toLowerCase().includes('latest') ||
                               content.toLowerCase().includes('today')
            setAiStatus(isNewsQuery 
                ? '🔍 Researching news and generating audio... (this may take a minute)'
                : '💭 Generating response...')
            
            // Call AI service
            const aiResponse = await aiService.sendMessage(conversationId, content)
            
            // Clear status and add assistant message
            setAiStatus('')
            const assistantMessage: Message = {
                id: aiResponse.messageId,
                conversationId,
                role: 'assistant',
                content: aiResponse.content,
                audioUrl: aiResponse.audioUrl || undefined,
                createdAt: new Date().toISOString()
            }
            setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
            console.error('Failed to send message:', error)
            setAiStatus('❌ Something went wrong. Please try again.')
            setTimeout(() => setAiStatus(''), 3000)
        } finally {
            setSending(false)
            setAiStatus('')
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
                {aiStatus && (
                    <div className="px-6 py-4 text-gray-500 italic">
                        {aiStatus}
                    </div>
                )}
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