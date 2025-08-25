import { memo } from 'react'

interface AssistantStatusProps {
    text: string
    variant?: 'neutral' | 'warning' | 'error'
}

const toneMap: Record<NonNullable<AssistantStatusProps['variant']>, string> = {
    neutral: 'from-purple-500/20 via-pink-500/20 to-cyan-400/20',
    warning: 'from-yellow-500/20 via-amber-500/20 to-orange-500/20',
    error: 'from-red-500/20 via-rose-500/20 to-pink-500/20'
}

const AssistantStatus = memo(({ text, variant = 'neutral' }: AssistantStatusProps) => {
    if (!text) return null

    return (
        <div className="px-6 py-4">
            <div className={`relative rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm`}>
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${toneMap[variant]} animate-pulse motion-reduce:animate-none`} style={{ filter: 'blur(10px)' }} />
                <div className="relative px-4 py-3 flex items-center gap-3">
                    <div className="relative w-5 h-5">
                        <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 opacity-70" />
                        <span className="absolute inset-0 rounded-full animate-ping motion-reduce:animate-none bg-purple-400 opacity-20" />
                    </div>
                    <p className="text-sm text-gray-700">{text}</p>
                </div>
            </div>
        </div>
    )
})

AssistantStatus.displayName = 'AssistantStatus'

export default AssistantStatus


