import { motion } from 'motion/react';

export default function LoadingScreen() {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-md"
    >
      {/* Background radial glow - Static for performance */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.15)_0%,_transparent_70%)] pointer-events-none" />
      
      <div className="relative w-full max-w-lg aspect-square flex items-center justify-center overflow-hidden">
        {/* Animated Glow Rings - Optimized */}
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full will-change-transform"
        />
        
        <video
          autoPlay
          loop
          muted
          playsInline
          className="relative z-10 w-full h-full object-contain mix-blend-screen drop-shadow-[0_0_20px_rgba(59,130,246,0.3)] will-change-transform"
        >
          <source src="/loading.webm" type="video/webm" />
        </video>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-4 flex flex-col items-center gap-4"
      >
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-black tracking-[0.2em] uppercase bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
            Memuat Koleksi
          </h2>
          <motion.div 
            animate={{ scaleX: [0, 1, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-0.5 w-48 bg-blue-400/50 mt-2 rounded-full origin-center"
          />
        </div>
        
        <p className="text-blue-200/50 font-bold text-xs tracking-widest uppercase animate-pulse">
          Menyiapkan Dunia Imajinasi...
        </p>
      </motion.div>
    </motion.div>
  );
}
