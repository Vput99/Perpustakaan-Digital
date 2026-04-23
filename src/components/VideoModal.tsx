import React from 'react';
import { motion } from 'motion/react';
import { X, Home, PlayCircle } from 'lucide-react';

interface VideoModalProps {
  driveId: string;
  youtubeUrl?: string;
  title: string;
  onClose: () => void;
}

export default function VideoModal({ driveId, youtubeUrl, title, onClose }: VideoModalProps) {
  // Gunakan youtubeUrl jika ada, jika tidak gunakan link preview Google Drive
  const videoUrl = youtubeUrl || `https://drive.google.com/file/d/${driveId}/preview`;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-slate-900/95 backdrop-blur-md"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between w-full px-4 py-3 bg-slate-800/50 border-b border-white/10 text-white relative z-20">
        <div className="flex items-center gap-2">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-blue-400 font-black hover:text-blue-300 transition-colors"
          >
            <Home size={20} />
            <span className="hidden sm:inline text-white">SmartLibrary SD</span>
          </button>
        </div>
        <h2 className="text-sm font-black absolute left-1/2 -translate-x-1/2 max-w-[50%] truncate text-center flex items-center gap-2">
          <PlayCircle size={16} className="text-red-500" />
          {title}
        </h2>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Video Container */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 lg:p-12">
        <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
          <iframe 
            src={videoUrl}
            className="absolute inset-0 w-full h-full"
            allow="autoplay"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-6 text-center text-white/50 text-xs font-bold uppercase tracking-widest">
        Sedang Menonton: {title}
      </div>
    </motion.div>
  );
}
