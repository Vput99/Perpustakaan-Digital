/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { LibraryItem } from '../types';

interface LibraryCardProps {
  item: LibraryItem;
  onClick?: (item: LibraryItem) => void;
}

export default function LibraryCard({ item, onClick }: LibraryCardProps) {
  const isVideo = item.type === 'Video';

  return (
    <motion.div
      onClick={() => onClick && onClick(item)}
      whileHover={{ 
        y: -12, 
        scale: 1.05,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        borderColor: "rgba(255, 255, 255, 0.4)",
        backgroundColor: "rgba(255, 255, 255, 0.15)"
      }}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      className={`group relative h-full flex flex-col bg-white/10 backdrop-blur-md p-4 rounded-[2rem] border border-white/10 shadow-2xl transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
      id={`card-${item.id}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-white/5 mb-4 shadow-inner">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        
        {/* Type Overlay */}
        <div className="absolute top-3 right-3 z-10">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl backdrop-blur-md shadow-lg border border-white/20 ${isVideo ? 'bg-red-500/80 text-white' : 'bg-blue-500/80 text-white'}`}>
            {isVideo ? <Play size={18} fill="currentColor" /> : <BookOpen size={18} />}
          </div>
        </div>

        {/* Gradient Overlay for bottom text readability if needed (optional) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Hover Sparkle */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          whileHover={{ opacity: 1, scale: 1.2, rotate: [0, 45, -45, 0] }}
          className="absolute inset-0 flex items-center justify-center text-4xl pointer-events-none z-20"
        >
          ✨
        </motion.div>
      </div>

      <div className="flex flex-1 flex-col px-1">
        <h3 className="mb-2 line-clamp-2 text-sm font-black text-white group-hover:text-blue-300 transition-colors duration-300" id={`title-${item.id}`}>
          {item.title}
        </h3>
        <div className="mt-auto flex items-center gap-2">
           <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
           <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-300/80">
            {item.category}
          </p>
        </div>
      </div>

      {/* Decorative Shine Effect */}
      <div className="absolute -top-10 -left-10 w-20 h-20 bg-white/5 blur-3xl rounded-full pointer-events-none group-hover:bg-white/10 transition-colors" />
    </motion.div>
  );
}
