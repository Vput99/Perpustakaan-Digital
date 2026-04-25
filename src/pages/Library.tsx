import { useState, useMemo, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CategoryFilter from '../components/CategoryFilter';
import LibraryCard from '../components/LibraryCard';
import PdfModal from '../components/PdfModal';
import VideoModal from '../components/VideoModal';
import { fetchDriveData, getPdfUrl } from '../services/driveService';
import { Category, LibraryItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Ghost, Library, Trophy, Target, Sparkles, ChevronRight } from 'lucide-react';
import QuestModal from '../components/QuestModal';
import FloatingMascot from '../components/FloatingMascot';
import LoadingScreen from '../components/LoadingScreen';
import { useNavigate } from 'react-router-dom';

export default function LibraryPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('Semua');
  const [showQuest, setShowQuest] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<{url: string, title: string} | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{driveId: string, youtubeUrl?: string, title: string} | null>(null);
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-6xl space-y-4"
      >
        {/* Top Tile: Navbar */}
        <motion.div variants={itemVariants}>
          <Navbar onNavigateKantin={() => navigate('/login')} />
        </motion.div>

        {/* Bento Middle Section */}
        <div className="grid grid-cols-12 gap-4">
          <motion.div variants={itemVariants} animate={bobbingAnimation} className="col-span-12 lg:col-span-7">
             <Hero />
          </motion.div>

          <div className="col-span-12 flex flex-col gap-4 lg:col-span-5">
            <motion.div variants={itemVariants} className="flex-1 bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-100">
              <h3 className="mb-4 text-xs font-bold tracking-widest text-slate-400 uppercase">Kategori Belajar</h3>
              <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.button 
                variants={itemVariants}
                onClick={() => setShowQuest(true)}
                className="col-span-1 sm:col-span-2 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 flex items-center justify-between text-white shadow-lg"
              >
                <div>
                  <h3 className="text-2xl font-black mb-1">Misi Literasi</h3>
                  <p className="text-blue-100 text-sm font-medium">Selesaikan kuis & dapatkan koin!</p>
                </div>
                <Target size={48} className="opacity-20" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <LoadingScreen key="loading" />
            ) : filteredItems.length > 0 ? (
              <motion.div layout className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
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
                          setSelectedPdf({ url: getPdfUrl(clickedItem.driveId), title: clickedItem.title });
                        } else if (clickedItem.type === 'Video') {
                          setSelectedVideo({ driveId: clickedItem.driveId || '', youtubeUrl: clickedItem.youtubeUrl, title: clickedItem.title });
                        }
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-slate-100">
                <Ghost size={64} className="text-slate-200" />
                <h3 className="text-2xl font-bold text-slate-800 mt-4">Yah, Masih Kosong!</h3>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="bg-white rounded-3xl p-8 border-2 border-slate-100 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© 2026 SmartLibrary SD</p>
        </footer>
      </motion.div>

      <AnimatePresence>
        {showQuest && <QuestModal onClose={() => setShowQuest(false)} />}
        {selectedPdf && <PdfModal url={selectedPdf.url} title={selectedPdf.title} onClose={() => setSelectedPdf(null)} />}
        {selectedVideo && <VideoModal driveId={selectedVideo.driveId} youtubeUrl={selectedVideo.youtubeUrl} title={selectedVideo.title} onClose={() => setSelectedVideo(null)} />}
      </AnimatePresence>
      <FloatingMascot />
    </div>
  );
}
