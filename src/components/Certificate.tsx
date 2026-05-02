import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Download, Share2, CheckCircle2, Printer, X, MessageCircle, Facebook, Twitter, Copy, Check } from 'lucide-react';

interface CertificateProps {
  studentName: string;
  questTitle: string;
  date: string;
  onClose: () => void;
}

export default function Certificate({ studentName, questTitle, date, onClose }: CertificateProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.print();
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert("Menyiapkan dokumen PDF... Silakan pilih 'Save as PDF' di menu print.");
    window.print();
  };

  const shareText = `Hore! Saya baru saja menyelesaikan tantangan ${questTitle} di SmartLibrary SDN Tempurejo 1!`;
  const shareUrl = window.location.href;

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={20} />,
      color: 'bg-green-500',
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank')
    },
    {
      name: 'Facebook',
      icon: <Facebook size={20} />,
      color: 'bg-blue-600',
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
    },
    {
      name: 'Twitter',
      icon: <Twitter size={20} />,
      color: 'bg-sky-500',
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
    },
    {
      name: 'Salin Link',
      icon: copied ? <Check size={20} /> : <Copy size={20} />,
      color: 'bg-slate-600',
      action: () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-6xl bg-white rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b bg-slate-50">
          <div className="flex items-center gap-2">
            <Award className="text-blue-600" />
            <h3 className="font-bold text-slate-800">Sertifikat Digital</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              <Download size={18} />
              Unduh
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              <Printer size={18} />
              Cetak
            </button>
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Share2 size={18} />
                Kirim
              </button>

              <AnimatePresence>
                {showShareMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border p-2 z-50"
                    >
                      {shareOptions.map((option) => (
                        <button
                          key={option.name}
                          onClick={() => {
                            option.action();
                            setShowShareMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors text-sm text-slate-700"
                        >
                          <div className={`p-1.5 rounded-lg text-white ${option.color}`}>
                            {option.icon}
                          </div>
                          {option.name}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors ml-2"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Certificate Container - Optimized for A4 Landscape */}
        <div className="p-2 md:p-6 bg-slate-100/50 flex justify-center">
          <div
            id="certificate-print-area"
            className="relative w-full max-w-[1122px] aspect-[1.4142/1] bg-white shadow-2xl overflow-hidden ring-1 ring-slate-200"
            style={{
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
              width: '100%',
              maxWidth: '297mm' // A4 Landscape width
            } as any}
          >
            {/* Canva Embed Background */}
            <div className="absolute inset-0 z-0">
              <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                <iframe
                  loading="lazy"
                  style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, border: 'none', padding: 0, margin: 0 }}
                  src="https://www.canva.com/design/DAHIeCK2rxE/SSug20VjvvU-7unfYlUh0Q/view?embed"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Dynamic Content Overlay - Meticulously Aligned */}
            <div className="relative h-full flex flex-col items-center z-10 text-center pointer-events-none select-none">
              {/* Reduced Title Spacer */}
              <div className="h-[20%] md:h-[22%]" />

              {/* Generated Certificate Number */}
              <div className="w-full px-10">
                <p className="text-[10px] md:text-xs font-bold text-slate-500 tracking-[0.4em] uppercase opacity-80">
                  No. SL/{new Date().getFullYear()}/{Math.floor(1000 + Math.random() * 9000)}
                </p>
              </div>

              {/* Reduced Spacer before intro */}
              <div className="h-[16%] md:h-[18%]" />

              {/* Introductory Text */}
              <div className="w-full px-10">
                <p className="text-[10px] md:text-xs lg:text-sm text-slate-500 font-medium tracking-[0.1em] italic">
                  Penghargaan ini diberikan kepada:
                </p>
              </div>

              {/* Minimal spacer before Name */}
              <div className="h-[1%] md:h-[2%]" />

              {/* Student Name */}
              <div className="w-full px-12">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-cursive text-[#1e293b]">
                  {studentName}
                </h2>
              </div>

              {/* Description Below Name */}
              <div className="w-full px-32 mt-1 md:mt-2">
                <p className="text-[10px] md:text-xs lg:text-sm text-slate-600 font-medium tracking-wide">
                  Atas dedikasi dan prestasinya dalam menyelesaikan tantangan literasi
                </p>
              </div>

              {/* Quest Title */}
              <div className="w-full px-40 mt-3 md:mt-4">
                <p className="text-base md:text-lg lg:text-xl text-blue-700 font-extrabold italic tracking-tight">
                  "{questTitle}"
                </p>
                <div className="h-0.5 w-24 bg-blue-600/20 mx-auto mt-1" />
              </div>

              {/* Principal & Date - PULLED UP from bottom to avoid cut-off */}
              <div className="absolute bottom-[12%] w-full px-[15%] flex justify-between items-end">
                <div className="flex flex-col items-center">
                  <p className="text-[11px] md:text-xs lg:text-sm font-black text-[#1e293b] whitespace-nowrap">
                    Nita Ekaningkarti Adji, S.Pd.
                  </p>
                  <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Kepala Sekolah</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-[9px] md:text-[10px] font-black text-slate-500 font-mono tracking-widest uppercase">
                    {date}
                  </p>
                </div>
              </div>
            </div>

            {/* Subtle Print Protection Mask */}
            <div className="absolute inset-0 bg-white/0 pointer-events-none print:hidden" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
