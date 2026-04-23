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
      animate={{
        y: [0, -4, 0],
      }}
      transition={{
        y: {
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: Math.random() * 2
        }
      }}
      whileHover={{ 
        y: -12, 
        scale: 1.05,
        rotate: [0, -1, 1, -1, 0],
        boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.2)"
      }}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      className={`group relative h-full flex flex-col bg-white p-3 rounded-2xl border-2 border-slate-100 shadow-sm transition-all hover:border-blue-400 ${onClick ? 'cursor-pointer' : ''}`}
      id={`card-${item.id}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-50 mb-3">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        
        {/* Type Overlay */}
        <div className="absolute top-2 right-2 z-10">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg shadow-sm ${isVideo ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
            {isVideo ? <Play size={16} fill="currentColor" /> : <BookOpen size={16} />}
          </div>
        </div>

        {/* Hover Sparkle */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          whileHover={{ opacity: 1, scale: 1.2, rotate: [0, 45, -45, 0] }}
          className="absolute inset-0 flex items-center justify-center text-4xl pointer-events-none z-20"
        >
          ✨
        </motion.div>
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="mb-1 line-clamp-1 text-sm font-black text-slate-800" id={`title-${item.id}`}>
          {item.title}
        </h3>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {item.category}
        </p>
      </div>

      {/* Decorative dot */}
      <div className="absolute top-2 left-2 h-2 w-2 rounded-full bg-white opacity-40" />
    </motion.div>
  );
}
