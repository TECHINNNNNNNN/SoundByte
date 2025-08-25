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

  const iconSize = sizeMap[size]
  const outerSize = iconSize + 40
  const innerOrbitSize = iconSize + 12
  const ringThickness = Math.max(6, Math.round(iconSize * 0.08))

  return (
    <div
      className="flex flex-col items-center justify-center gap-6"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={message ?? 'Loading'}
    >
      <div className="relative" style={{ width: outerSize, height: outerSize }}>
        {/* Outer rotating gradient ring (performance-friendly: transform only) */}
        <div
          className="absolute inset-0 rounded-full animate-spin motion-reduce:animate-none"
          style={{
            animationDuration: '8s',
            background:
              'conic-gradient(from 0deg, rgba(168,85,247,0.45), rgba(236,72,153,0.45), rgba(34,211,238,0.45), rgba(168,85,247,0.45))',
            WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${ringThickness}px), black 0)`,
            mask: `radial-gradient(farthest-side, transparent calc(100% - ${ringThickness}px), black 0)`
          }}
        />

        {/* Soft glow ring */}
        <div
          className="absolute inset-0 rounded-full blur-lg opacity-50 animate-spin motion-reduce:animate-none"
          style={{
            animationDuration: '14s',
            background:
              'conic-gradient(from 90deg, rgba(168,85,247,0.25), rgba(236,72,153,0.25), rgba(34,211,238,0.25), rgba(168,85,247,0.25))',
            WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${ringThickness * 3}px), black 0)`,
            mask: `radial-gradient(farthest-side, transparent calc(100% - ${ringThickness * 3}px), black 0)`
          }}
        />

        {/* Orbiting accent dots */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="relative animate-spin motion-reduce:animate-none"
            style={{ width: innerOrbitSize, height: innerOrbitSize, animationDuration: '5s' }}
          >
            <span className="absolute left-1/2 top-0 -translate-x-1/2 w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_6px_rgba(236,72,153,0.7)]" />
            <span className="absolute left-1/2 bottom-0 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.7)]" />
          </div>
        </div>

        {/* Center SoundByte icon */}
        <div className="relative flex items-center justify-center">
          <SoundByteIcon size={iconSize} animated={true} />
        </div>
      </div>

      {/* Message for users and assistive tech */}
      {message ? (
        <div className="text-center">
          <p className="text-base md:text-lg font-semibold text-gray-700">{message}</p>
        </div>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  )
}

export default SoundByteLoader