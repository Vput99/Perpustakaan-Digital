/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Category } from '../types';

interface CategoryFilterProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
}

export default function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
  const categories: { name: Category; icon: string; color: string; bg: string; border: string }[] = [
    { name: 'Semua', icon: '🔍', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
    { name: 'Buku Pelajaran', icon: '✏️', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-100' },
    { name: 'Numerasi', icon: '🔢', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100' },
    { name: 'Buku Cerita', icon: '📚', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-100' },
    { name: 'Video', icon: '🎬', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-100' },
  ];

  return (
    <div className="flex flex-wrap gap-3" id="category-filter">
      {categories.map((cat) => (
        <motion.button
          key={cat.name}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCategoryChange(cat.name)}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 p-3 rounded-2xl border font-black transition-all group ${
            activeCategory === cat.name
              ? `bg-white/20 text-white border-white/40 shadow-xl`
              : `bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/20`
          }`}
          id={`filter-${cat.name.replace(/\s+/g, '-').toLowerCase()}`}
        >
          <span className="text-xl inline-block group-hover:scale-110 transition-transform">
            {cat.icon}
          </span>
          <span className="text-sm">{cat.name}</span>
        </motion.button>
      ))}
    </div>
  );
}
