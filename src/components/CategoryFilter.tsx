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
    { name: 'Buku Cerita', icon: '📚', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-100' },
    { name: 'Video', icon: '🎬', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-100' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3" id="category-filter">
      {categories.map((cat) => (
        <motion.button
          key={cat.name}
          whileHover={{ scale: 1.05, rotate: 1 }}
          whileTap={{ scale: 0.95 }}
          animate={activeCategory === cat.name ? { 
            scale: [1, 1.02, 1],
            boxShadow: ["0 0 0px rgba(59, 130, 246, 0)", "0 0 20px rgba(59, 130, 246, 0.2)", "0 0 0px rgba(59, 130, 246, 0)"]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          onClick={() => onCategoryChange(cat.name)}
          className={`flex items-center gap-3 p-3 rounded-2xl border-2 font-bold transition-all group ${
            activeCategory === cat.name
              ? `${cat.bg} ${cat.color} ${cat.border} ring-2 ring-blue-400 ring-offset-2 shadow-lg`
              : `bg-white text-slate-500 border-slate-100 hover:border-slate-200`
          }`}
          id={`filter-${cat.name.replace(/\s+/g, '-').toLowerCase()}`}
        >
          <motion.span 
            className="text-xl inline-block origin-bottom"
            animate={activeCategory === cat.name ? { 
              y: [0, -8, 0],
              rotate: [0, -10, 10, -10, 0]
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            whileHover={{ rotate: 360, scale: 1.4 }}
          >
            {cat.icon}
          </motion.span>
          <span className="text-sm">{cat.name}</span>
        </motion.button>
      ))}
    </div>
  );
}
