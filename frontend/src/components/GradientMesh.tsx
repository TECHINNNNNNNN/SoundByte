export default function GradientMesh() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-white to-pink-50/50" />
      
      {/* Animated gradient blobs using CSS */}
      <div className="absolute inset-0">
        {/* Blob 1 - Purple/Pink */}
        <div 
          className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-purple-200/40 to-pink-200/40 rounded-full blur-3xl animate-blob"
          style={{ filter: 'blur(64px)' }}
        />
        
        {/* Blob 2 - Blue/Purple */}
        <div 
          className="absolute top-1/2 -right-20 w-[500px] h-[500px] bg-gradient-to-bl from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-blob animation-delay-2000"
          style={{ filter: 'blur(72px)' }}
        />
        
        {/* Blob 3 - Pink/Orange */}
        <div 
          className="absolute -bottom-20 left-1/3 w-[450px] h-[450px] bg-gradient-to-tr from-pink-200/35 to-orange-200/25 rounded-full blur-3xl animate-blob animation-delay-4000"
          style={{ filter: 'blur(80px)' }}
        />
        
        {/* Blob 4 - Yellow/Pink - smaller accent */}
        <div 
          className="absolute top-1/4 left-1/2 w-72 h-72 bg-gradient-to-br from-yellow-200/25 to-pink-200/25 rounded-full blur-3xl animate-blob animation-delay-2000"
          style={{ filter: 'blur(60px)' }}
        />
      </div>
      
      {/* Mesh overlay for texture */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='30' cy='30' r='1' fill='%239333ea' opacity='0.5'/%3E%3Ccircle cx='15' cy='15' r='0.5' fill='%23ec4899' opacity='0.3'/%3E%3Ccircle cx='45' cy='45' r='0.5' fill='%23a855f7' opacity='0.3'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Noise texture overlay for depth */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}