/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategoryFilter from './components/CategoryFilter';
import LibraryCard from './components/LibraryCard';
import PdfModal from './components/PdfModal';
import { fetchDriveData, getPdfUrl } from './services/driveService';
import { Category, LibraryItem } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Ghost, Library, Trophy, Target, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import QuestModal from './components/QuestModal';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<Category>('Semua');
  const [showQuest, setShowQuest] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<{url: string, title: string} | null>(null);
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const driveData = await fetchDriveData();
        setItems(driveData);
      } catch (error) {
        console.error("Error loading items", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'Semua') return items;
    return items.filter(item => item.category === activeCategory);
  }, [activeCategory, items]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8 font-nunito text-slate-800">
      <div className="mx-auto max-w-6xl space-y-4">
        {/* Top Tile: Navbar */}
        <Navbar />

        {/* Bento Middle Section */}
        <div className="grid grid-cols-12 gap-4">
          {/* Main Hero Tile */}
          <div className="col-span-12 lg:col-span-7">
             <Hero />
          </div>

          {/* Right Column Bento Tiles */}
          <div className="col-span-12 flex flex-col gap-4 lg:col-span-5">
            {/* Category Tile */}
            <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-100">
              <h3 className="mb-4 text-xs font-bold tracking-widest text-slate-400 uppercase">Kategori Belajar</h3>
              <CategoryFilter 
                activeCategory={activeCategory} 
                onCategoryChange={setActiveCategory} 
              />
            </div>

            {/* Small Quick Tiles Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowQuest(true)}
                className="col-span-1 sm:col-span-2 group relative overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 flex items-center justify-between text-white shadow-lg shadow-indigo-100 transition-all text-left"
              >
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-3">
                    <Sparkles size={12} /> Misi Minggu Ini
                  </div>
                  <h3 className="text-2xl font-black mb-1">Pahlawan Literasi</h3>
                  <p className="text-blue-100 text-sm font-medium">Selesaikan kuis & dapatkan sertifikatmu!</p>
                  <div className="mt-4 flex items-center gap-1 font-black text-xs uppercase tracking-tighter text-yellow-400">
                    Mulai Sekarang <ChevronRight size={14} />
                  </div>
                </div>
                <div className="relative z-10 shrink-0">
                  <Target size={64} className="text-white/20 group-hover:text-white/40 transition-colors" />
                </div>
                {/* Decorative circles */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              </motion.button>

              <div className="bg-yellow-400 rounded-3xl p-6 flex flex-col justify-center items-center text-yellow-900 shadow-sm">
                <span className="text-3xl font-black">120+</span>
                <span className="text-[10px] font-bold uppercase tracking-tight">Koleksi Baru</span>
              </div>
              <div className="bg-slate-800 rounded-3xl p-6 flex items-center gap-4 text-white shadow-sm">
                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xl">🏆</div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Reader</p>
                   <p className="font-black leading-tight">Andi Saputra</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Books Grid Title Tile */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Library size={18} />
             </div>
             <h2 className="text-xl font-black text-slate-800">Koleksi {activeCategory}</h2>
           </div>
           <p className="hidden text-xs font-bold text-slate-400 sm:block uppercase tracking-widest">
             {filteredItems.length} Materi Tersedia
           </p>
        </div>

        {/* Books Grid */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border-2 border-slate-100"
              >
                <div className="mb-6 rounded-full bg-slate-100 p-8 text-blue-500">
                  <Loader2 size={64} className="animate-spin" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Memuat Koleksi...</h3>
                <p className="text-slate-500">Tunggu sebentar ya, sedang mengambil buku dari rak.</p>
              </motion.div>
            ) : filteredItems.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
                id="library-grid"
              >
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LibraryCard 
                      item={item} 
                      onClick={(clickedItem) => {
                        if (clickedItem.type === 'PDF' && clickedItem.driveId) {
                          setSelectedPdf({
                            url: getPdfUrl(clickedItem.driveId),
                            title: clickedItem.title
                          });
                        }
                        // Jika video, bisa ditambahkan logika lain nanti
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border-2 border-slate-100"
              >
                <div className="mb-6 rounded-full bg-slate-100 p-8 text-slate-300">
                  <Ghost size={64} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Yah, Masih Kosong!</h3>
                <p className="text-slate-500">Koleksi ini sedang disiapkan.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Tile */}
        <footer className="bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-sm">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-blue-600" />
              <span className="font-black text-slate-800">SmartLibrary SD</span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© 2026 Belajar Itu Seru</p>
            <div className="flex gap-2">
               <div className="h-4 w-4 rounded-full bg-blue-400" />
               <div className="h-4 w-4 rounded-full bg-pink-400" />
               <div className="h-4 w-4 rounded-full bg-yellow-400" />
            </div>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {showQuest && <QuestModal onClose={() => setShowQuest(false)} />}
        {selectedPdf && (
          <PdfModal 
            url={selectedPdf.url} 
            title={selectedPdf.title} 
            onClose={() => setSelectedPdf(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
