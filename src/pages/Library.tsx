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
  const [selectedPdf, setSelectedPdf] = useState<{ url: string, title: string } | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{ driveId: string, youtubeUrl?: string, title: string } | null>(null);
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
    <div className="min-h-screen relative font-nunito text-white overflow-x-hidden">
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/back.webm" type="video/webm" />
        </video>
        {/* Overlay for better contrast and depth - Optimized blur */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/70 via-slate-900/50 to-blue-900/70 backdrop-blur-[1px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10 space-y-8"
      >
        {/* Top Section: Navbar */}
        <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-2 shadow-2xl shadow-black/20">
          <Navbar onNavigateKantin={() => navigate('/login')} />
        </motion.div>

        {/* Bento Middle Section */}
        <div className="grid grid-cols-12 gap-6">
          <motion.div variants={itemVariants} animate={bobbingAnimation} className="col-span-12 lg:col-span-8 group">
            <div className="h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-500 group-hover:border-white/30 group-hover:bg-white/10">
              <Hero />
            </div>
          </motion.div>

          <div className="col-span-12 flex flex-col gap-6 lg:col-span-4">
            <motion.div
              variants={itemVariants}
              className="flex-1 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-900/20 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-400/40 transition-colors duration-500" />
              <h3 className="mb-6 text-xs font-black tracking-[0.2em] text-blue-200 uppercase flex items-center gap-2">
                <Sparkles size={14} />
                Kategori Belajar
              </h3>
              <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
            </motion.div>

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowQuest(true)}
              className="bg-gradient-to-br from-indigo-500/80 to-blue-600/80 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 flex items-center justify-between text-white shadow-2xl shadow-blue-900/40 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="relative z-10">
                <h3 className="text-3xl font-black mb-1 tracking-tight">Misi Literasi</h3>
                <p className="text-blue-100/80 text-sm font-semibold flex items-center gap-2">
                  Selesaikan tantangan & raih koin! <ChevronRight size={16} />
                </p>
              </div>
              <div className="relative">
                <Trophy size={56} className="text-yellow-300 opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full"
                />
              </div>
            </motion.button>
          </div>
        </div>

        {/* Books Section Header */}
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
              <Library className="text-blue-300" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Koleksi Digital</h2>
              <p className="text-slate-400 text-sm font-medium">Menampilkan {filteredItems.length} konten seru</p>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        <div className="min-h-[500px] px-2">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <LoadingScreen key="loading" />
            ) : filteredItems.length > 0 ? (
              <motion.div
                className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
              >
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-32 bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 shadow-2xl"
              >
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                  <Ghost size={48} className="text-slate-500/50" />
                </div>
                <h3 className="text-3xl font-black text-white/90">Ups, Masih Kosong!</h3>
                <p className="text-slate-400 font-medium mt-2">Coba pilih kategori yang lain ya.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="bg-white/5 backdrop-blur-md rounded-[2rem] p-10 border border-white/10 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <p className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] relative z-10">
            © 2026 <span className="text-blue-400">SmartLibrary SD</span> • Dibuat dengan ❤️ untuk Masa Depan
          </p>
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
