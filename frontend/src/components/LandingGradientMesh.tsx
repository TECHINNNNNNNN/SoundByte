export default function LandingGradientMesh() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Soft white/gray base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/30 to-white" />
      
      {/* Soft, light-toned gradient orbs */}
      <div className="absolute inset-0">
        {/* Soft rose orb - top left */}
        <div className="absolute -top-64 -left-64 w-[1200px] h-[1200px] animate-float-slow">
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(255, 228, 230, 0.4) 0%, rgba(255, 237, 243, 0.3) 35%, rgba(255, 241, 242, 0.15) 60%, transparent 80%)',
              filter: 'blur(40px)',
              transform: 'translate3d(0, 0, 0)',
            }}
          />
        </div>

        {/* Soft lavender orb - right side */}
        <div className="absolute top-20 -right-48 w-[1000px] h-[1000px] animate-float-slow-reverse">
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle at center, rgba(243, 232, 255, 0.35) 0%, rgba(245, 243, 255, 0.2) 40%, transparent 75%)',
              filter: 'blur(35px)',
              transform: 'translate3d(0, 0, 0)',
            }}
          />
        </div>

        {/* Soft sky blue orb - bottom left */}
        <div className="absolute -bottom-32 left-1/4 w-[900px] h-[900px] animate-float-medium">
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle at center, rgba(219, 234, 254, 0.3) 0%, rgba(224, 242, 254, 0.15) 50%, transparent 75%)',
              filter: 'blur(30px)',
              transform: 'translate3d(0, 0, 0)',
            }}
          />
        </div>

        {/* Soft peach orb - center floating */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] animate-float-fast">
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle at center, rgba(255, 237, 213, 0.25) 0%, rgba(255, 247, 237, 0.15) 50%, transparent 70%)',
              filter: 'blur(25px)',
              transform: 'translate3d(0, 0, 0)',
            }}
          />
        </div>

        {/* Soft mint orb - bottom right */}
        <div className="absolute bottom-1/4 right-1/3 w-[750px] h-[750px] animate-float-slow">
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle at center, rgba(220, 252, 231, 0.2) 0%, rgba(236, 253, 245, 0.1) 50%, transparent 75%)',
              filter: 'blur(35px)',
              transform: 'translate3d(0, 0, 0)',
            }}
          />
        </div>

        {/* Soft pearl orb - top center */}
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] animate-float-medium">
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle at center, rgba(248, 250, 252, 0.5) 0%, rgba(241, 245, 249, 0.25) 50%, transparent 70%)',
              filter: 'blur(30px)',
              transform: 'translate3d(0, 0, 0)',
            }}
          />
        </div>
      </div>

      {/* Ultra-subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='80' height='80' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 80 0 L 0 0 0 80' fill='none' stroke='%23e5e7eb' stroke-width='0.5' opacity='0.3'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Very subtle noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-soft-light pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}