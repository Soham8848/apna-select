export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md">
      <div className="relative flex items-center justify-center w-20 h-20 mb-6">
        {/* Outer Ring */}
        <div className="absolute w-full h-full border-t-4 border-b-4 border-l-4 border-r-4 border-transparent border-t-zinc-900 border-b-zinc-900 dark:border-t-white dark:border-b-white rounded-full animate-spin"></div>
        
        {/* Inner Ring (Spins opposite direction) */}
        <div 
          className="absolute w-12 h-12 border-t-4 border-b-4 border-l-4 border-r-4 border-transparent border-l-blue-500 border-r-purple-500 rounded-full animate-spin" 
          style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}
        ></div>
        
        {/* Center Dot */}
        <div className="w-3 h-3 bg-zinc-900 dark:bg-white rounded-full animate-pulse"></div>
      </div>
      
      {/* Pulsing Brand Text */}
      <div className="text-sm font-bold tracking-[0.3em] text-zinc-900 dark:text-white uppercase animate-pulse">
        APNA.SELECT
      </div>
    </div>
  );
}
