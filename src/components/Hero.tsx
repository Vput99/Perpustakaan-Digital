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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black text-white mb-6 leading-[1.1]"
        >
          Halo Sahabat Cilik! <br />
          <span className="text-blue-200">Ayo Petualang Lewat Buku</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-blue-100 text-lg mb-8 font-medium"
        >
          Temukan ribuan cerita seru dan ilmu pengetahuan menarik di sini.
        </motion.p>
        <motion.button 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-lg hover:shadow-xl transition-shadow"
        >
          Mulai Membaca
        </motion.button>
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
