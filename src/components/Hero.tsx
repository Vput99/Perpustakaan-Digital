/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Users } from 'lucide-react';
import { motion } from 'motion/react';

export default function Hero() {
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

      {/* Lottie Placeholder Animation */}
      <div className="absolute right-[-40px] bottom-[-40px] md:right-[-20px] md:bottom-[-20px] w-64 h-64 md:w-80 md:h-80 bg-blue-500/30 rounded-full flex items-center justify-center border-4 border-blue-400/20 translate-x-10 translate-y-10">
        <div className="text-center opacity-40">
           <Users size={80} color="white" className="mx-auto animate-bounce" />
           <p className="text-[10px] text-white font-black uppercase tracking-widest mt-2">Lottie: Anak SD Menyapa</p>
        </div>
      </div>
    </div>
  );
}
