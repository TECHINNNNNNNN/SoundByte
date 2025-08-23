
import { useState, type KeyboardEvent } from 'react'
import { Banana } from 'lucide-react';
import { z } from 'zod'

interface MessageInputProps {
    onSendMessage: (message: string) => void
    disabled?: boolean
    placeholder?: string
}

const messageInputSchema = z.object({
    message: z.string().trim().min(1, { message: 'Message is required' }).max(1000, { message: 'Message must be less than 1000 characters' })
})

const MessageInput = ({ onSendMessage, disabled = false, placeholder = "Type your message..." }: MessageInputProps) => {
    const [message, setMessage] = useState('')
    const [error, setError] = useState<{ [key: string]: string }>({})

    const handleSend = () => {
        try {
            messageInputSchema.parse({ message })
            onSendMessage(message)
            setMessage('')
            setError({})
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors: { [key: string]: string } = {}
                error.issues.forEach((issue) => {
                    const field = String(issue.path[0] ?? 'message')
                    errors[field] = issue.message
                })
                setError(errors)
            } else {
                console.error('Failed to send message:', error)
                setError({ message: 'Failed to send message' })
            }
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
                        className={`w-full shadow-md border border-gray-200 px-4 py-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${error.message ? 'border-red-500' : ''}`}
                    />
                    {error.message && (
                        <p className="text-xs text-red-500 mt-1">{error.message}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                        Press Enter to send, Shift+Enter for new line
                    </p>
                </div>
                <button
                    onClick={handleSend}
                    disabled={disabled || !!error.message || !message.trim()}
                    className="px-4 py-2 bg-pink-600 text-white rounded-xl cursor-pointer hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition absolute right-6"
                >
                    <Banana className="size-5" />
                </button>
            </div>
        </div>
    )
}

export default MessageInput