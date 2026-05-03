import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Share2, Printer, X, MessageCircle, Copy, Check, Sparkles, Star, ArrowLeft } from 'lucide-react';

// ============================================================
// TIPE DATA (PROPS)
// Data yang harus dikirim ke komponen ini dari parent
// ============================================================
interface CertificateProps {
  studentName: string; // Nama siswa penerima sertifikat
  questTitle: string;  // Judul tantangan/quest yang diselesaikan
  date: string;        // Tanggal sertifikat diterbitkan
  onClose: () => void; // Fungsi untuk menutup modal sertifikat
}

// ============================================================
// KOMPONEN: Partikel Mengambang (Floating Particles)
// Membuat efek bintang / kilau yang melayang di background
// ============================================================
function FloatingParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5,
      duration: Math.random() * 8 + 6,
      opacity: Math.random() * 0.5 + 0.2,
    }))
  , []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, rgba(255,215,0,${p.opacity}) 0%, transparent 70%)`,
            boxShadow: `0 0 ${p.size * 3}px rgba(255,215,0,${p.opacity * 0.5})`,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ============================================================
// KOMPONEN: Ornamen Sudut SVG (Corner Ornament)
// Dekorasi sudut sertifikat bergaya klasik emas
// ============================================================
function CornerOrnament({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const transforms: Record<string, string> = {
    'top-left': '',
    'top-right': 'scaleX(-1)',
    'bottom-left': 'scaleY(-1)',
    'bottom-right': 'scale(-1)',
  };
  const positions: Record<string, React.CSSProperties> = {
    'top-left': { top: 0, left: 0 },
    'top-right': { top: 0, right: 0 },
    'bottom-left': { bottom: 0, left: 0 },
    'bottom-right': { bottom: 0, right: 0 },
  };

  return (
    <svg
      width="90"
      height="90"
      viewBox="0 0 90 90"
      className="absolute z-30 pointer-events-none"
      style={{ ...positions[position], transform: transforms[position] }}
    >
      <defs>
        <linearGradient id={`gold-grad-${position}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFA500" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
      </defs>
      <path
        d="M0,0 L40,0 C35,5 30,10 28,18 C26,26 30,30 22,35 C14,40 8,35 5,30 L0,40 Z"
        fill={`url(#gold-grad-${position})`}
        opacity="0.8"
      />
      <path
        d="M0,0 Q15,5 20,20 Q5,15 0,0 Z"
        fill="#FFD700"
        opacity="0.6"
      />
      <circle cx="12" cy="12" r="3" fill="#FFF8DC" opacity="0.9" />
      <circle cx="22" cy="8" r="1.5" fill="#FFF8DC" opacity="0.6" />
      <circle cx="8" cy="22" r="1.5" fill="#FFF8DC" opacity="0.6" />
    </svg>
  );
}

// ============================================================
// KOMPONEN UTAMA: Certificate
// ============================================================
export default function Certificate({ studentName, questTitle, date, onClose }: CertificateProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Fungsi: Mencetak sertifikat menggunakan dialog print browser
  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.print();
  };

  // Fungsi: Menyalin URL halaman ke clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // CSS Keyframe styles injected inline
  const shimmerKeyframes = `
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes border-glow {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
    @keyframes float-badge {
      0%, 100% { transform: translateY(0px) rotate(-2deg); }
      50% { transform: translateY(-8px) rotate(2deg); }
    }
    @keyframes pulse-ring {
      0% { transform: scale(0.95); opacity: 0.7; }
      50% { transform: scale(1.05); opacity: 1; }
      100% { transform: scale(0.95); opacity: 0.7; }
    }
    @keyframes rotate-slow {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <>
      <style>{shimmerKeyframes}</style>

      {/* Backdrop gelap + blur — menutupi seluruh layar */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 print:bg-transparent print:p-0 print:items-start print:justify-start"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(59,7,100,0.95) 0%, rgba(15,23,42,0.97) 50%, rgba(0,0,0,0.98) 100%)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Partikel Mengambang */}
        <FloatingParticles />

        {/* Ambient glow effects */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)',
              filter: 'blur(80px)',
              animation: 'pulse-ring 4s ease-in-out infinite',
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15"
            style={{
              background: 'radial-gradient(circle, rgba(147,51,234,0.3) 0%, transparent 70%)',
              filter: 'blur(60px)',
              animation: 'pulse-ring 5s ease-in-out infinite 1s',
            }}
          />
        </div>

        {/* Modal utama — muncul dengan animasi dari bawah */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.85, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25, duration: 0.8 }}
          className="relative w-[95vw] max-w-[1000px] overflow-hidden z-10"
          style={{
            borderRadius: '2rem',
            background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
            boxShadow: `
              0 0 0 1px rgba(255,215,0,0.15),
              0 0 30px rgba(255,215,0,0.1),
              0 50px 100px -20px rgba(0,0,0,0.7),
              inset 0 1px 0 rgba(255,255,255,0.05)
            `,
          }}
        >
          {/* Animated gold border glow */}
          <div
            className="absolute inset-0 rounded-[2rem] pointer-events-none z-0"
            style={{
              border: '2px solid transparent',
              backgroundClip: 'padding-box',
              boxShadow: `
                inset 0 0 30px rgba(255,215,0,0.05),
                0 0 20px rgba(255,215,0,0.08)
              `,
              animation: 'border-glow 3s ease-in-out infinite',
            }}
          />

          {/* Gold accent line at top */}
          <div
            className="absolute top-0 left-0 right-0 h-1 z-50"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, #FFD700 20%, #FFA500 50%, #FFD700 80%, transparent 100%)',
              boxShadow: '0 0 20px rgba(255,215,0,0.4)',
            }}
          />

          {/* ====================================================
              BAGIAN 1: HEADER / TOOLBAR
              Berisi judul, tombol Cetak, Bagikan, dan Tutup.
              Bagian ini TIDAK ikut tercetak (class no-print).
          ==================================================== */}
          <div
            className="flex items-center justify-between px-6 py-4 md:px-8 md:py-5 relative z-50"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              borderBottom: '1px solid rgba(255,215,0,0.1)',
            }}
          >
            {/* Judul Header */}
            <div className="flex items-center gap-4 md:gap-6">
              {/* Tombol Kembali */}
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/70 hover:text-white transition-all font-bold text-sm"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Kembali</span>
              </motion.button>

              <div className="flex items-center gap-3 md:gap-4">
                <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="p-2 md:p-3 rounded-2xl relative"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #B8860B 100%)',
                  boxShadow: '0 8px 25px rgba(255,215,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
                }}
              >
                <Award className="text-white drop-shadow-md" size={24} />
                {/* Sparkle effect */}
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ scale: [0, 1, 0], rotate: [0, 180, 360] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  <Sparkles size={12} className="text-yellow-300" />
                </motion.div>
              </motion.div>
              <div>
                <h3
                  className="font-extrabold text-lg md:text-xl tracking-tight"
                  style={{
                    background: 'linear-gradient(90deg, #FFD700, #FFF8DC, #FFD700)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'shimmer 3s linear infinite',
                  }}
                >
                  Sertifikat Digital
                </h3>
                <p className="text-amber-200/50 text-[10px] font-bold uppercase tracking-[0.2em]">
                  Penghargaan Literasi SDN Tempurejo 1
                </p>
              </div>
            </div>
          </div>

            {/* Tombol Aksi */}
            <div className="flex items-center gap-2 md:gap-3">

              {/* Tombol Cetak */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrint}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 md:px-6 md:py-3 rounded-2xl font-bold text-sm transition-all"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Printer size={18} />
                Cetak
              </motion.button>

              {/* Tombol Bagikan + Dropdown Menu */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center gap-2 px-4 py-2.5 md:px-6 md:py-3 rounded-2xl font-bold text-sm transition-all text-white"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    boxShadow: '0 8px 25px rgba(255,165,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
                    color: '#1a1a2e',
                  }}
                >
                  <Share2 size={18} />
                  Bagikan
                </motion.button>

                {/* Dropdown share menu dengan animasi */}
                <AnimatePresence>
                  {showShareMenu && (
                    <>
                      {/* Overlay untuk menutup menu ketika klik di luar */}
                      <div className="fixed inset-0 z-10" onClick={() => setShowShareMenu(false)} />

                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-60 rounded-3xl p-3 z-20"
                        style={{
                          background: 'linear-gradient(145deg, #1e2746, #1a2040)',
                          border: '1px solid rgba(255,215,0,0.15)',
                          boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 20px rgba(255,215,0,0.05)',
                        }}
                      >
                        {/* Opsi: Bagikan ke WhatsApp */}
                        <button
                          onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('Lihat sertifikat saya! ' + window.location.href)}`)}
                          className="w-full flex items-center gap-3 p-4 rounded-2xl transition-colors font-bold text-sm text-left text-white/80 hover:text-white"
                          style={{ hover: 'background: rgba(255,255,255,0.05)' } as any}
                        >
                          <div className="p-2 bg-green-500 text-white rounded-xl shadow-lg shadow-green-500/20">
                            <MessageCircle size={18} />
                          </div>
                          WhatsApp
                        </button>

                        {/* Opsi: Salin Link */}
                        <button
                          onClick={handleCopyLink}
                          className="w-full flex items-center gap-3 p-4 rounded-2xl transition-colors font-bold text-sm text-left text-white/80 hover:text-white"
                        >
                          <div className="p-2 rounded-xl shadow-lg" style={{ background: 'rgba(255,255,255,0.1)' }}>
                            {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} className="text-white/80" />}
                          </div>
                          {copied ? 'Berhasil Disalin!' : 'Salin Link'}
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Tombol Tutup Modal */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 text-white/30 hover:text-white rounded-full transition-all"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <X size={24} />
              </motion.button>
            </div>
          </div>

          {/* ====================================================
              BAGIAN 2: KERTAS SERTIFIKAT (PRINTABLE AREA)
              Berisi background Canva + overlay teks dinamis.
              Proporsi A4 Landscape (297mm x 210mm).
          ==================================================== */}
          <div
            className="p-4 md:p-8 flex justify-center items-center overflow-auto max-h-[65vh]"
            style={{
              background: `
                radial-gradient(ellipse at 50% 0%, rgba(255,215,0,0.05) 0%, transparent 50%),
                linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.1) 100%)
              `,
            }}
          >
            {/* Outer decorative frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="relative p-[2px] rounded-lg flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 25%, #FFD700 50%, #DAA520 75%, #FFD700 100%)',
                backgroundSize: '200% 200%',
                animation: 'shimmer 4s linear infinite',
                boxShadow: '0 0 30px rgba(255,215,0,0.15), 0 15px 40px rgba(0,0,0,0.4)',
                transform: 'scale(var(--cert-scale, 1))',
              }}
            >
              {/* Inner frame padding */}
              <div className="p-[4px] rounded-md" style={{ background: '#1a1a2e' }}>
                <div
                  id="certificate-print-area"
                  className="relative overflow-hidden flex-shrink-0 rounded-sm"
                  style={{
                    width: 'min(700px, 85vw)',
                    height: 'min(495px, 60vw)',
                    boxShadow: 'inset 0 0 80px rgba(0,0,0,0.3)',
                  }}
                >
                  {/* Corner Ornaments */}
                  <CornerOrnament position="top-left" />
                  <CornerOrnament position="top-right" />
                  <CornerOrnament position="bottom-left" />
                  <CornerOrnament position="bottom-right" />

                  {/* --- Layer 0: Background Desain dari Canva (z-index: 0) --- */}
                  <div className="absolute inset-0 z-0">
                    <iframe
                      loading="lazy"
                      title="Sertifikat Canva"
                      className="w-full h-full border-none pointer-events-none"
                      src="https://www.canva.com/design/DAHIeCK2rxE/SSug20VjvvU-7unfYlUh0Q/view?embed"
                      allowFullScreen
                    />
                  </div>

                  {/* --- Layer 1: Overlay Teks Dinamis (z-index: 10) ---
                      Semua elemen diposisikan secara absolut agar presisi.
                  */}
                  <div className="absolute inset-0 z-10 pointer-events-none select-none">

                    {/* 1. Nomor Sertifikat — di antara PENGHARGAAN dan PENGHARGAAN INI DIBERIKAN KEPADA */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -10 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                      className="absolute top-[32%] left-0 w-full text-center"
                    >
                      <span
                        className="text-[9px] font-bold tracking-[0.35em] uppercase"
                        style={{ color: 'rgba(148,163,184,0.9)', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                      >
                        No. SL/{new Date().getFullYear()}/{Math.floor(1000 + Math.random() * 9000)}
                      </span>
                    </motion.div>

                    {/* 2. Nama Siswa — di bawah garis "PENGHARGAAN INI DIBERIKAN KEPADA:", tepat pada garis nama */}
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20, scale: isVisible ? 1 : 0.9 }}
                      transition={{ delay: 1, duration: 0.7, type: 'spring' }}
                      className="absolute top-[42%] left-0 w-full text-center"
                    >
                      <h1
                        className="text-[52px] font-cursive leading-none"
                        style={{
                          color: '#1e293b',
                          textShadow: '0 2px 4px rgba(0,0,0,0.1), 0 0 20px rgba(255,215,0,0.1)',
                        }}
                      >
                        {studentName}
                      </h1>
                    </motion.div>

                  </div>

                  {/* --- Layer 2: Masker Transparan (z-index: 20) ---
                      Mencegah interaksi langsung dengan iframe Canva.
                  */}
                  <div className="absolute inset-0 z-20" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* ====================================================
              BAGIAN 3: FOOTER INFO BAR
              Info tambahan di bawah sertifikat
          ==================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="px-8 py-5 flex items-center justify-between"
            style={{
              borderTop: '1px solid rgba(255,215,0,0.08)',
              background: 'rgba(0,0,0,0.15)',
            }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <Star size={16} className="text-amber-400/50" />
              </motion.div>
              <p className="text-white/30 text-xs font-bold tracking-wider">
                Quest: <span className="text-amber-300/60">{questTitle}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-white/30 text-xs font-bold tracking-wider">
                Diterbitkan: <span className="text-white/50">{date}</span>
              </p>
              <div className="w-1 h-1 rounded-full bg-amber-400/30" />
              <p className="text-white/30 text-xs font-bold tracking-wider">
                SDN Tempurejo 1
              </p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </>
  );
}
