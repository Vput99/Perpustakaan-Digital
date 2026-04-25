/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CategoryFilter from '../components/CategoryFilter';
import LibraryCard from '../components/LibraryCard';
import PdfModal from '../components/PdfModal';
import VideoModal from '../components/VideoModal';
import { fetchDriveData, getPdfUrl } from '../services/driveService';
import { Category, LibraryItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Ghost, Library, Trophy, Target, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import QuestModal from '../components/QuestModal';
import FloatingMascot from '../components/FloatingMascot';
import LoadingScreen from '../components/LoadingScreen';

export default function LibraryView() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const role = searchParams.get('role');
  const kelas = searchParams.get('kelas');
  const isUmum = role === 'Umum';

  const [activeCategory, setActiveCategory] = useState<Category>('Semua');
  const [showQuest, setShowQuest] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<{url: string, title: string} | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{driveId: string, youtubeUrl?: string, title: string} | null>(null);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const bobbingAnimation = {
    y: [0, -5, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="min-h-screen relative bg-slate-50 p-4 md:p-6 lg:p-8 font-nunito text-slate-800 overflow-hidden">
      {/* Elemen Latar Belakang Mengambang */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, -30, 0], rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-[10%] text-6xl opacity-20 drop-shadow-md"
        >
          ⭐
        </motion.div>
        <motion.div
          animate={{ y: [0, 40, 0], x: [0, 20, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[5%] text-8xl opacity-20 drop-shadow-lg"
        >
          ☁️
        </motion.div>
        <motion.div
          animate={{ y: [0, -50, 0], x: [0, -30, 0], rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[15%] left-[5%] text-7xl opacity-20 drop-shadow-xl"
        >
          🚀
        </motion.div>
        <motion.div
          animate={{ y: [0, 30, 0], rotate: [0, -25, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[40%] right-[10%] text-6xl opacity-20 drop-shadow-md"
        >
          📚
        </motion.div>
        <motion.div
          animate={{ y: [0, -40, 0], x: [0, 40, 0], rotate: [0, 45, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[40%] left-[2%] text-6xl opacity-20 drop-shadow-md font-bold text-blue-500"
        >
          123
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -45, 0], scale: [1, 1.4, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute top-[60%] right-[2%] text-5xl opacity-20 drop-shadow-md"
        >
          🧮
        </motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-6xl space-y-4"
      >
        {/* Top Tile: Navbar */}
        <motion.div variants={itemVariants}>
          <Navbar />
          {kelas && (
            <div className="mt-2 text-center text-sm font-bold text-blue-600 bg-blue-100 p-2 rounded-xl">
              Selamat datang, Siswa Kelas {kelas}!
            </div>
          )}
        </motion.div>

        {/* Bento Middle Section */}
        <div className="grid grid-cols-12 gap-4">
          {/* Main Hero Tile */}
          <motion.div
            variants={itemVariants}
            animate={bobbingAnimation}
            className="col-span-12 lg:col-span-7"
          >
             <Hero />
          </motion.div>

          {/* Right Column Bento Tiles */}
          <div className="col-span-12 flex flex-col gap-4 lg:col-span-5">
            {/* Category Tile */}
            <motion.div
              variants={itemVariants}
              animate={{
                ...bobbingAnimation,
                transition: { ...bobbingAnimation.transition, delay: 0.5 }
              }}
              className="flex-1 bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-100"
            >
              <h3 className="mb-4 text-xs font-bold tracking-widest text-slate-400 uppercase">Kategori Belajar</h3>
              <CategoryFilter
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </motion.div>

            {/* Small Quick Tiles Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!isUmum && (
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.05, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowQuest(true)}
                className="col-span-1 sm:col-span-2 group relative overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 flex items-center justify-between text-white shadow-lg shadow-indigo-100 transition-all text-left"
              >
                <div className="relative z-10">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-3"
                  >
                    <Sparkles size={12} /> Misi Minggu Ini
                  </motion.div>
                  <h3 className="text-2xl font-black mb-1">Pahlawan Literasi</h3>
                  <p className="text-blue-100 text-sm font-medium">Selesaikan kuis & dapatkan sertifikatmu!</p>
                  <div className="mt-4 flex items-center gap-1 font-black text-xs uppercase tracking-tighter text-yellow-400">
                    Mulai Sekarang <ChevronRight size={14} />
                  </div>
                </div>
                <div className="relative z-10 shrink-0">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    <Target size={64} className="text-white/20 group-hover:text-white/40 transition-colors" />
                  </motion.div>
                </div>
                {/* Decorative circles */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              </motion.button>
              )}

              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.1, rotate: -3 }}
                className="bg-yellow-400 rounded-3xl p-6 flex flex-col justify-center items-center text-yellow-900 shadow-sm relative overflow-hidden"
              >
                <motion.span
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl font-black z-10"
                >
                  120+
                </motion.span>
                <span className="text-[10px] font-bold uppercase tracking-tight z-10">Koleksi Baru</span>
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.5, 1] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute -right-4 -top-4 text-5xl opacity-30"
                >
                  ✨
                </motion.div>
              </motion.div>
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.1, rotate: 3 }}
                className="bg-slate-800 rounded-3xl p-6 flex items-center gap-4 text-white shadow-sm group"
              >
                 <motion.div
                   animate={{
                     rotateY: [0, 360],
                     scale: [1, 1.2, 1]
                   }}
                   transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                   className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-700 text-2xl drop-shadow-lg"
                 >
                   🏆
                 </motion.div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Reader</p>
                   <p className="font-black leading-tight group-hover:text-yellow-400 transition-colors">Andi Saputra</p>
                 </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Books Grid Title Tile */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-100 flex items-center justify-between"
        >
           <div className="flex items-center gap-3">
             <motion.div
               animate={{ rotate: [0, 10, -10, 0] }}
               transition={{ duration: 3, repeat: Infinity }}
               className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"
             >
                <Library size={18} />
             </motion.div>
             <h2 className="text-xl font-black text-slate-800">Koleksi {activeCategory}</h2>
           </div>
           <p className="hidden text-xs font-bold text-slate-400 sm:block uppercase tracking-widest">
             {filteredItems.length} Materi Tersedia
           </p>
        </motion.div>

        {/* Books Grid */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <LoadingScreen key="loading" />
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
                        } else if (clickedItem.type === 'Video') {
                          setSelectedVideo({
                            driveId: clickedItem.driveId || '',
                            youtubeUrl: clickedItem.youtubeUrl,
                            title: clickedItem.title
                          });
                        }
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
        <motion.footer
          variants={itemVariants}
          className="bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-sm"
        >
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="h-6 w-6 rounded bg-blue-600"
              />
              <span className="font-black text-slate-800">SmartLibrary SD</span>
            </motion.div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© 2026 Belajar Itu Seru</p>
            <div className="flex gap-2">
               {[...Array(3)].map((_, i) => (
                 <motion.div
                   key={i}
                   animate={{ scale: [1, 1.3, 1] }}
                   transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                   className={`h-4 w-4 rounded-full ${['bg-blue-400', 'bg-pink-400', 'bg-yellow-400'][i]}`}
                 />
               ))}
            </div>
          </div>
        </motion.footer>
      </motion.div>

      <AnimatePresence>
        {showQuest && <QuestModal onClose={() => setShowQuest(false)} />}
        {selectedPdf && (
          <PdfModal
            url={selectedPdf.url}
            title={selectedPdf.title}
            onClose={() => setSelectedPdf(null)}
          />
        )}
        {selectedVideo && (
          <VideoModal
            driveId={selectedVideo.driveId}
            youtubeUrl={selectedVideo.youtubeUrl}
            title={selectedVideo.title}
            onClose={() => setSelectedVideo(null)}
          />
        )}
      </AnimatePresence>
      {!isUmum && <FloatingMascot />}
    </div>
  );
}
