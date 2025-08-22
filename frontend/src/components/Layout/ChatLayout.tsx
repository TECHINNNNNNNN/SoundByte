import { useState } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'
import conversationService from '../../services/conversation.service'
import GradientMesh from '../GradientMesh'

const ChatLayout = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    const handleNewConversation = async () => {
        try {
            const now = new Date()
            const title = `New Chat ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            const conversation = await conversationService.createConversation(title)
            setRefreshTrigger(prev => prev + 1) // Trigger sidebar refresh
            navigate(`/playground/chat/${conversation.id}`)
        } catch (error) {
            console.error('Failed to create conversation:', error)
        }
    }

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <div className="h-screen flex flex-col relative">
            <GradientMesh />

            {/* Top Navigation Bar */}
            <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 h-16 flex items-center px-4 shadow-sm relative z-50">
                <div className="flex items-center justify-between w-full max-w-full">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2.5 hover:bg-purple-50 rounded-xl transition-all duration-200 group"
                        >
                            <svg className="w-6 h-6 text-gray-600 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 className="text-2xl font-black text-gradient flex items-center gap-2">
                            <span className="text-3xl animate-pulse">💬</span>
                            Playground
                        </h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-4 py-2 text-purple-700 font-medium rounded-full bg-purple-50 transition-all duration-200 text-sm hover:shadow-glow hover:scale-[1.02] transform cursor-pointer"
                        >
                            ← Back to Digests
                        </button>
                        <div className="flex items-center gap-3 px-4 py-2 bg-white/50 rounded-full border border-gray-100">
                            <span className="text-sm text-gray-600 font-medium">
                                {user?.name || user?.email?.split('@')[0]}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-medium hover:shadow-glow transition-all duration-200 text-sm hover:scale-[1.02] transform cursor-pointer"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden relative z-10">
                {/* Sidebar */}
                <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden`}>
                    <Sidebar onNewConversation={handleNewConversation} refreshTrigger={refreshTrigger} />
                </div>

                {/* Chat Area */}
                <div className="flex-1 relative">
                    <Outlet context={{ onNewConversation: handleNewConversation }} />
                </div>
            </div>
        </div>
    )
}

export default ChatLayout