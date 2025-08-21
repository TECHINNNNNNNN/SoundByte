import { useState, useRef, useEffect } from 'react'
import SoundByteIcon from './SoundByteIcon'

interface AudioPlayerProps {
  src: string
  title?: string
  subtitle?: string
  variant?: 'full' | 'mini' | 'compact'
  autoPlay?: boolean
  onEnded?: () => void
  className?: string
}

export default function AudioPlayer({
  src,
  title,
  subtitle,
  variant = 'full',
  autoPlay = false,
  onEnded,
  className = ''
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const setAudioData = () => {
      setDuration(audio.duration)
      setCurrentTime(audio.currentTime)
      setIsLoading(false)
    }

    const setAudioTime = () => setCurrentTime(audio.currentTime)
    const handleEnded = () => {
      setIsPlaying(false)
      if (onEnded) onEnded()
    }

    audio.addEventListener('loadeddata', setAudioData)
    audio.addEventListener('timeupdate', setAudioTime)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', () => setError(true))

    if (autoPlay) {
      audio.play().then(() => setIsPlaying(true))
    }

    return () => {
      audio.removeEventListener('loadeddata', setAudioData)
      audio.removeEventListener('timeupdate', setAudioTime)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [autoPlay, onEnded])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
      setIsPlaying(true)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const progressBar = progressRef.current
    if (!audio || !progressBar) return

    const rect = progressBar.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * duration
    
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    audio.volume = newVolume
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.volume = volume || 0.5
      setIsMuted(false)
      setVolume(volume || 0.5)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
  }

  const changePlaybackRate = () => {
    const audio = audioRef.current
    if (!audio) return

    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2]
    const currentIndex = rates.indexOf(playbackRate)
    const nextIndex = (currentIndex + 1) % rates.length
    const newRate = rates[nextIndex]
    
    audio.playbackRate = newRate
    setPlaybackRate(newRate)
  }

  const skip = (seconds: number) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = Math.max(0, Math.min(duration, audio.currentTime + seconds))
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercent = duration ? (currentTime / duration) * 100 : 0

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
        <p className="text-red-600 text-sm">Failed to load audio</p>
      </div>
    )
  }

  // Compact variant for inline use
  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-xl border border-gray-100 p-3 ${className}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlayPause}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center hover:shadow-glow transition-all duration-200"
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          
          <div className="flex-1">
            {title && <p className="text-sm font-semibold text-gray-800 truncate">{title}</p>}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{formatTime(currentTime)}</span>
              <div 
                ref={progressRef}
                onClick={handleProgressClick}
                className="flex-1 h-1 bg-gray-200 rounded-full cursor-pointer relative"
              >
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{formatTime(duration)}</span>
            </div>
          </div>
        </div>
        <audio ref={audioRef} src={src} preload="metadata" />
      </div>
    )
  }

  // Mini variant for smaller spaces
  if (variant === 'mini') {
    return (
      <div className={`bg-white rounded-2xl border border-gray-100 shadow-lg p-4 ${className}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlayPause}
            disabled={isLoading}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center hover:shadow-glow transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? (
              <SoundByteIcon size={24} animated={true} />
            ) : isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          
          <div className="flex-1">
            {title && <p className="font-semibold text-gray-800">{title}</p>}
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            
            <div className="mt-2">
              <div 
                ref={progressRef}
                onClick={handleProgressClick}
                className="h-2 bg-gray-200 rounded-full cursor-pointer relative overflow-hidden"
              >
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">{formatTime(currentTime)}</span>
                <span className="text-xs text-gray-500">{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </div>
        <audio ref={audioRef} src={src} preload="metadata" />
      </div>
    )
  }

  // Full variant - default
  return (
    <div className={`bg-white/90 backdrop-blur-lg rounded-3xl border border-gray-100 shadow-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <SoundByteIcon size={40} animated={isPlaying} />
          </div>
          <div>
            {title && <h3 className="text-lg font-bold text-gray-800">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
      </div>

      {/* Main Controls */}
      <div className="mb-6">
        {/* Progress Bar */}
        <div 
          ref={progressRef}
          onClick={handleProgressClick}
          className="h-3 bg-gray-200 rounded-full cursor-pointer relative overflow-hidden group"
        >
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-300 group-hover:shadow-glow"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        
        {/* Time Display */}
        <div className="flex justify-between mt-2">
          <span className="text-sm text-gray-600">{formatTime(currentTime)}</span>
          <span className="text-sm text-gray-600">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-4 mb-6">
        {/* Skip Backward */}
        <button
          onClick={() => skip(-15)}
          className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
          title="Skip backward 15s"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
            <text x="12" y="16" fontSize="10" textAnchor="middle" fill="currentColor">15</text>
          </svg>
        </button>

        {/* Play/Pause */}
        <button
          onClick={togglePlayPause}
          disabled={isLoading}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center hover:shadow-glow transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-8 h-8 border-3 border-white/30 rounded-full animate-spin border-t-white" />
          ) : isPlaying ? (
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Skip Forward */}
        <button
          onClick={() => skip(15)}
          className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
          title="Skip forward 15s"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" transform="scale(-1, 1)">
            <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
            <text x="12" y="16" fontSize="10" textAnchor="middle" fill="currentColor" transform="scale(-1, 1)" style={{ transformOrigin: '12px 16px' }}>15</text>
          </svg>
        </button>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between">
        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="text-gray-600 hover:text-purple-600 transition-colors">
            {isMuted || volume === 0 ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>

        {/* Playback Speed */}
        <button
          onClick={changePlaybackRate}
          className="px-3 py-1 text-sm text-gray-600 hover:text-purple-600 font-medium transition-colors"
        >
          {playbackRate}x
        </button>
      </div>

      <audio ref={audioRef} src={src} preload="metadata" />
    </div>
  )
}