
import { type Message } from '../../services/conversation.service'
import AudioPlayer from '../AudioPlayer'
import { Speech } from 'lucide-react';
import SoundByteIcon from '../SoundByteIcon';

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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-purple-400' : 'bg-pink-50'
                        }`}>
                        {isUser ? (
                            <Speech className="size-3 text-white" />
                        ) : (
                            <SoundByteIcon size={24} animated={true} />
                        )}
                    </div>
                </div>

                {/* Message Content */}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2 rounded-2xl ${isUser
                        ? 'bg-purple-100 text-gray-700'
                        : 'bg-pink-100 text-gray-700'
                        }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {/* Audio Player (if audio exists) */}
                    {message.audioUrl && (
                        <div className="mt-3 max-w-md">
                            <AudioPlayer
                                src={message.audioUrl}
                                title="Audio Summary"
                                subtitle={message.audioDuration ? `Duration: ${Math.floor(message.audioDuration / 60)}:${(message.audioDuration % 60).toString().padStart(2, '0')}` : undefined}
                                variant="mini"
                            />
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