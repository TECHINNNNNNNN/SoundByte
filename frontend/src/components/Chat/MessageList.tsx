import { type Message } from '../../services/conversation.service'
import MessageComponent from './Message'

interface MessageListProps {
    messages: Message[]
}

const MessageList = ({ messages }: MessageListProps) => {
    if (messages.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                        Start a conversation
                    </h3>
                    <p className="text-gray-500 text-sm">
                        Ask me about any news topic and I'll research it for you
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="px-4 py-6">
            {messages.map((message) => (
                <MessageComponent key={message.id} message={message} />
            ))}
        </div>
    )
}

export default MessageList