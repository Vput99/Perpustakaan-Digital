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
          whileTap={{ scale: 0.95 }}
          onClick={() => onCategoryChange(cat.name)}
          className={`flex items-center gap-3 p-3 rounded-2xl border-2 font-bold transition-all ${
            activeCategory === cat.name
              ? `${cat.bg} ${cat.color} ${cat.border} ring-2 ring-blue-400 ring-offset-2 shadow-lg`
              : `bg-white text-slate-500 border-slate-100 hover:border-slate-200`
          }`}
          id={`filter-${cat.name.replace(/\s+/g, '-').toLowerCase()}`}
        >
          <span className="text-xl">{cat.icon}</span>
          <span className="text-sm">{cat.name}</span>
        </motion.button>
      ))}
    </div>
  );
}
