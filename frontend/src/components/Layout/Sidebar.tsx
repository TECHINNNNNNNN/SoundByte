import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import conversationService, { type Conversation } from '../../services/conversation.service'

interface SidebarProps {
    onNewConversation: () => void
    refreshTrigger?: number
}

const Sidebar = ({ onNewConversation, refreshTrigger = 0 }: SidebarProps) => {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const navigate = useNavigate()
    const { conversationId } = useParams()

    useEffect(() => {
        loadConversations()
    }, [refreshTrigger])

    const loadConversations = async () => {
        try {
            setLoading(true)
            const data = await conversationService.getConversations()
            setConversations(data)
        } catch (error) {
            console.error('Failed to load conversations:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleConversationClick = (id: string) => {
        navigate(`/dashboard/chat/${id}`)
    }

    const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (window.confirm('Are you sure you want to delete this conversation?')) {
            try {
                await conversationService.deleteConversation(id)
                setConversations(conversations.filter(c => c.id !== id))
                if (conversationId === id) {
                    navigate('/dashboard')
                }
            } catch (error) {
                console.error('Failed to delete conversation:', error)
            }
        }
    }

    return (
        <div className="w-64 bg-gray-900 text-white h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <button
                    onClick={onNewConversation}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>New Chat</span>
                </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-center text-gray-400">Loading...</div>
                ) : conversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                        <p>No conversations yet</p>
                        <p className="text-sm mt-2">Start a new chat to begin</p>
                    </div>
                ) : (
                    <div className="p-2">
                        {conversations.map(conversation => (
                            <div
                                key={conversation.id}
                                onClick={() => handleConversationClick(conversation.id)}
                                className={`
                  group flex items-center justify-between p-3 rounded-lg cursor-pointer
                  hover:bg-gray-800 transition mb-1
                  ${conversationId === conversation.id ? 'bg-gray-800' : ''}
                `}
                            >
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-medium truncate">
                                        {conversation.title}
                                    </h3>
                                    {conversation.messages && conversation.messages[0] && (
                                        <p className="text-xs text-gray-400 truncate mt-1">
                                            {conversation.messages[0].content}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(conversation.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => handleDeleteConversation(e, conversation.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition"
                                >
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700">
                <div className="text-xs text-gray-400 text-center">
                    SoundByte v1.0
                </div>
            </div>
        </div>
    )
}

export default Sidebar