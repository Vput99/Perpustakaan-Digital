/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { motion } from 'motion/react';

export default function Hero() {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    // URL Lottie Animasi Melambai (Anda bisa mengganti URL JSON ini dengan animasi Anak SD dari LottieFiles)
    fetch('https://assets2.lottiefiles.com/packages/lf20_touohxv0.json')
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => console.error("Error loading Lottie animation:", err));
  }, []);

  return (
    <div className="relative h-full min-h-[320px] overflow-hidden bg-blue-600 rounded-3xl flex items-center p-8 md:p-12 shadow-md shadow-blue-100" id="hero-section">
      <div className="z-10 max-w-md">
        <motion.h2 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl md:text-5xl font-black text-white mb-6 leading-[1.1]"
        >
          <motion.span
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            style={{
              backgroundImage: "linear-gradient(90deg, #ffffff, #93c5fd, #ffffff)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            Halo Sahabat Cilik!
          </motion.span>
          <br />
          <motion.span 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-blue-200 inline-block mt-2"
          >
            Ayo Petualang Lewat Buku & Angka
          </motion.span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-blue-100 text-lg mb-8 font-medium"
        >
          Temukan ribuan cerita seru dan petualangan berhitung di sini.
        </motion.p>
        <motion.button 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-lg hover:shadow-xl transition-shadow relative z-10"
        >
          Mulai Membaca
        </motion.button>
      </div>

      {/* Floating Particles/Shapes for extra "busy" feel */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 400, 
              y: Math.random() * 300,
              opacity: 0.2
            }}
            animate={{ 
              y: [0, -40, 0],
              x: [0, Math.random() * 20 - 10, 0],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 4 + Math.random() * 4, 
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            className="absolute text-2xl"
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%` 
            }}
          >
            {['✨', '🎈', '🔢', '🌟', '➕', '🍕', '➖', '🧮'][i % 8]}
          </motion.div>
        ))}
      </div>

      {/* Lottie Animation */}
      <div className="absolute right-[-20px] bottom-[-20px] md:right-10 md:bottom-[-40px] w-64 h-64 md:w-96 md:h-96 pointer-events-none z-0">
        {animationData ? (
          <Lottie animationData={animationData} loop={true} className="w-full h-full" />
        ) : (
          <div className="w-full h-full bg-blue-500/20 rounded-full animate-pulse" />
        )}
      </div>
    </div>
  );
}
