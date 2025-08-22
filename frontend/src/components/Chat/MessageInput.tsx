

import { useState, type KeyboardEvent } from 'react'

interface MessageInputProps {
    onSendMessage: (message: string) => void
    disabled?: boolean
    placeholder?: string
}

const MessageInput = ({ onSendMessage, disabled = false, placeholder = "Type your message..." }: MessageInputProps) => {
    const [message, setMessage] = useState('')

    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSendMessage(message)
            setMessage('')
        }
    }

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="p-4">
            <div className="flex items-center justify-center relative space-x-2">
                <div className="flex-1">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={placeholder}
                        disabled={disabled}
                        rows={3}
                        className="w-full shadow-md border border-gray-200 px-4 py-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Press Enter to send, Shift+Enter for new line
                    </p>
                </div>
                <button
                    onClick={handleSend}
                    disabled={disabled || !message.trim()}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition absolute right-6"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default MessageInput