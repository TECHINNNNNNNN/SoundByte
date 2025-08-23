export default function AnimatedGradientMesh() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Soft base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 via-white to-pink-50/20" />
      
      {/* Animated gradient blobs using pure CSS animations */}
      <div className="absolute inset-0">
        {/* Large purple blob */}
        <div className="absolute -top-48 -left-48 w-[800px] h-[800px] animate-float-slow">
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.08) 0%, transparent 70%)',
              filter: 'blur(100px)',
            }}
          />
        </div>

        {/* Pink blob */}
        <div className="absolute top-1/3 -right-48 w-[700px] h-[700px] animate-float-slow-reverse">
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle at center, rgba(236, 72, 153, 0.06) 0%, transparent 70%)',
              filter: 'blur(120px)',
            }}
          />
        </div>

        {/* Blue accent blob */}
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] animate-float-medium">
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle at center, rgba(147, 197, 253, 0.05) 0%, transparent 70%)',
              filter: 'blur(110px)',
            }}
          />
        </div>

        {/* Small accent blob */}
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] animate-float-fast">
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle at center, rgba(251, 207, 232, 0.08) 0%, transparent 60%)',
              filter: 'blur(80px)',
            }}
          />
        </div>
      </div>

      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.01] mix-blend-soft-light pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}