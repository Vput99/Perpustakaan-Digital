import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FloatingMascot() {
  const [animationData, setAnimationData] = useState<any>(null);
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    // Memuat animasi Lottie Anak SD / maskot lucu yang sedang melambaikan tangan
    fetch('https://assets2.lottiefiles.com/packages/lf20_touohxv0.json')
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => console.error("Error loading Lottie animation:", err));
      
    // Menampilkan balon percakapan setelah 1.5 detik
    const timer = setTimeout(() => {
      setShowBubble(true);
    }, 1500);
    
    // Menyembunyikan balon percakapan setelah 8 detik
    const timer2 = setTimeout(() => {
      setShowBubble(false);
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end">
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9, rotate: -5 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: 10, scale: 0.9, rotate: -5 }}
            className="bg-white text-blue-800 p-4 rounded-2xl rounded-br-none shadow-xl border-2 border-blue-100 mb-4 mr-10 relative max-w-[220px]"
          >
            <p className="font-bold text-sm leading-relaxed">
              Halo Kak! 👋<br/>
              <span className="font-medium text-slate-600">Selamat datang di PerpusKita. Ayo mulai membaca!</span>
            </p>
            {/* Segitiga panah chat bubble */}
            <div className="absolute -bottom-3 right-4 w-6 h-6 bg-white border-b-2 border-r-2 border-blue-100 transform rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div 
        className="w-32 h-32 md:w-40 md:h-40 cursor-pointer"
        whileHover={{ scale: 1.1, translateY: -10 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowBubble(!showBubble)}
      >
        {animationData ? (
          <Lottie animationData={animationData} loop={true} className="w-full h-full drop-shadow-2xl" />
        ) : (
          <div className="w-24 h-24 bg-blue-400 rounded-full animate-pulse border-4 border-white shadow-lg flex items-center justify-center">
             <span className="text-white font-bold text-xs">Memuat...</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
