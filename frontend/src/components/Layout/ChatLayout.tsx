import { useState } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'
import conversationService from '../../services/conversation.service'

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
            navigate(`/dashboard/chat/${conversation.id}`)
        } catch (error) {
            console.error('Failed to create conversation:', error)
        }
    }

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <div className="h-screen flex flex-col">
            {/* Top Navigation Bar */}
            <nav className="bg-white shadow-sm border-b h-16 flex items-center px-4">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">SoundByte</h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                            {user?.name || user?.email}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className={`${sidebarOpen ? 'block' : 'hidden'} transition-all duration-300`}>
                    <Sidebar onNewConversation={handleNewConversation} refreshTrigger={refreshTrigger} />
                </div>

                {/* Chat Area */}
                <div className="flex-1 bg-gray-50">
                    <Outlet context={{ onNewConversation: handleNewConversation }} />
                </div>
            </div>
        </div>
    )
}

export default ChatLayout