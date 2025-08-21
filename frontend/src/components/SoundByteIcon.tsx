interface SoundByteIconProps {
  size?: number
  animated?: boolean
  className?: string
}

export default function SoundByteIcon({ 
  size = 40, 
  animated = true, 
  className = '' 
}: SoundByteIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 240 240" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="iconGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0.9" />
        </linearGradient>
        
        <linearGradient id="iconGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#fb923c" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      <g transform="translate(120, 120)">
        {/* Outer Wave */}
        <path 
          d="M -60 0 Q -45 -30, -30 0 T 0 0 T 30 0 T 60 0" 
          stroke="url(#iconGradient1)" 
          strokeWidth="8" 
          fill="none" 
          strokeLinecap="round"
          opacity="0.9"
        >
          {animated && (
            <animateTransform
              attributeName="transform"
              type="scale"
              values="1;1.1;1"
              dur="3s"
              repeatCount="indefinite"
            />
          )}
        </path>

        {/* Middle Wave */}
        <path 
          d="M -40 0 Q -30 -20, -20 0 T 0 0 T 20 0 T 40 0" 
          stroke="url(#iconGradient2)" 
          strokeWidth="12" 
          fill="none" 
          strokeLinecap="round"
          opacity="0.8"
        >
          {animated && (
            <animateTransform
              attributeName="transform"
              type="scale"
              values="1;1.15;1"
              dur="3s"
              begin="0.5s"
              repeatCount="indefinite"
            />
          )}
        </path>

        {/* Inner Wave */}
        <path 
          d="M -20 0 Q -15 -10, -10 0 T 0 0 T 10 0 T 20 0" 
          stroke="url(#iconGradient1)" 
          strokeWidth="16" 
          fill="none" 
          strokeLinecap="round"
        >
          {animated && (
            <animateTransform
              attributeName="transform"
              type="scale"
              values="1;1.2;1"
              dur="3s"
              begin="1s"
              repeatCount="indefinite"
            />
          )}
        </path>

        {/* Center Dot */}
        <circle cx="0" cy="0" r="8" fill="url(#iconGradient1)">
          {animated && (
            <animate 
              attributeName="r" 
              values="8;10;8" 
              dur="3s" 
              repeatCount="indefinite"
            />
          )}
        </circle>

        {/* Floating Particles (only when animated) */}
        {animated && (
          <g opacity="0.6">
            <circle cx="-50" cy="-20" r="3" fill="#ec4899">
              <animate 
                attributeName="cy" 
                values="-20;-30;-20" 
                dur="4s" 
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="50" cy="20" r="3" fill="#a855f7">
              <animate 
                attributeName="cy" 
                values="20;30;20" 
                dur="4s" 
                begin="1s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        )}
      </g>
    </svg>
  )
}