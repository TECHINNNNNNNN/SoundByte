

import { type Message } from '../../services/conversation.service'

interface MessageProps {
    message: Message
}

const MessageComponent = ({ message }: MessageProps) => {
    const isUser = message.role === 'user'

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`flex max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-600' : 'bg-gray-600'
                        }`}>
                        {isUser ? (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        )}
                    </div>
                </div>

                {/* Message Content */}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2 rounded-lg ${isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {/* Audio Player (if audio exists) */}
                    {message.audioUrl && (
                        <div className="mt-2 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-purple-600">🎧</span>
                                <span className="text-sm font-medium text-gray-700">Audio Summary Available</span>
                            </div>
                            <audio controls className="w-full max-w-md">
                                <source src={message.audioUrl} type="audio/wav" />
                                <source src={message.audioUrl} type="audio/mpeg" />
                                Your browser does not support the audio element.
                            </audio>
                            {message.audioDuration && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Duration: {Math.floor(message.audioDuration / 60)}:{(message.audioDuration % 60).toString().padStart(2, '0')}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Timestamp */}
                    <p className="text-xs text-gray-400 mt-1">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default MessageComponent