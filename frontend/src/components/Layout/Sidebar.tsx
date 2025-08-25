import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import conversationService, { type Conversation } from '../../services/conversation.service'
import toast from 'react-hot-toast'

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
            toast.error('Failed to load conversations')
        } finally {
            setLoading(false)
        }
    }

    const handleConversationClick = (id: string) => {
        navigate(`/playground/chat/${id}`)
    }

    const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (window.confirm('Are you sure you want to delete this conversation?')) {
            try {
                await conversationService.deleteConversation(id)
                setConversations(conversations.filter(c => c.id !== id))
                toast.success('Conversation deleted')
                if (conversationId === id) {
                    navigate('/playground')
                }
            } catch (error) {
                console.error('Failed to delete conversation:', error)
                toast.error('Failed to delete conversation')
            }
        }
    }

    return (
        <div className="w-80 bg-white/60 backdrop-blur-lg h-full flex flex-col border-r border-gray-100 shadow-xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <button
                    onClick={onNewConversation}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-glow transform hover:scale-[1.02] transition-all duration-200"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>New Chat</span>
                </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="w-8 h-8 border-3 border-purple-200 rounded-full animate-spin border-t-purple-600"></div>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-3">💭</div>
                        <p className="text-gray-600 font-semibold">No conversations yet</p>
                        <p className="text-sm text-gray-500 mt-2">Start a new chat to begin</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {conversations.map(conversation => (
                            <div
                                key={conversation.id}
                                onClick={() => handleConversationClick(conversation.id)}
                                className={`
                                    group relative flex items-start p-4 rounded-xl cursor-pointer
                                    transition-all duration-200 hover:shadow-md
                                    ${conversationId === conversation.id
                                        ? 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200'
                                        : 'bg-white hover:bg-gray-50 border border-gray-100'
                                    }
                                `}
                            >
                                <div className="flex-1 min-w-0">
                                    <h3 className={`text-sm font-semibold truncate ${conversationId === conversation.id
                                            ? 'text-purple-700'
                                            : 'text-gray-800 group-hover:text-purple-600'
                                        }`}>
                                        {conversation.title}
                                    </h3>
                                    {conversation.messages && conversation.messages[0] && (
                                        <p className="text-xs text-gray-500 truncate mt-1.5 pr-2">
                                            {conversation.messages[0].content}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-2">
                                        {new Date(conversation.updatedAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => handleDeleteConversation(e, conversation.id)}
                                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition-all duration-200"
                                >
                                    <svg className="w-4 h-4 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center justify-center gap-2">
                    <span className="text-xs text-gray-400">Powered by</span>
                    <span className="text-xs font-bold text-gradient">SoundByte AI</span>
                </div>
            </div>
        </div>
    )
}

export default Sidebar