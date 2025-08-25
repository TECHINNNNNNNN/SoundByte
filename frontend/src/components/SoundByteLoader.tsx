import SoundByteIcon from './SoundByteIcon'

interface SoundByteLoaderProps {
  size?: 'small' | 'medium' | 'large'
  message?: string
}

const SoundByteLoader = ({ size = 'medium', message }: SoundByteLoaderProps) => {
  const sizeMap = {
    small: 80,
    medium: 120,
    large: 200
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative">
        {/* Simple pulsing background circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="rounded-full bg-gradient-to-r from-purple-200 to-pink-200 animate-pulse"
            style={{ 
              width: sizeMap[size] + 30, 
              height: sizeMap[size] + 30 
            }}
          />
        </div>
        
        {/* SoundByte Icon with simple scale animation */}
        <div className="relative animate-pulse">
          <SoundByteIcon size={sizeMap[size]} animated={true} />
        </div>

        {/* Three dots loader below */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
      
      {message && (
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700">
            {message}
          </p>
        </div>
      )}
    </div>
  )
}

export default SoundByteLoader