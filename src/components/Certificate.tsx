/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Award, Star, Download, Share2 } from 'lucide-react';

interface CertificateProps {
  studentName: string;
  questTitle: string;
  date: string;
  onClose: () => void;
}

export default function Certificate({ studentName, questTitle, date, onClose }: CertificateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-4xl bg-white p-1 rounded-3xl overflow-hidden shadow-2xl border-[12px] border-blue-600"
    >
      {/* Decorative Background Patterns */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent" />
        <div className="grid grid-cols-10 gap-4 p-4">
          {Array.from({ length: 100 }).map((_, i) => (
            <Award key={i} className="text-blue-900" size={24} />
          ))}
        </div>
      </div>

      <div className="relative border-4 border-dashed border-blue-200 m-2 p-12 text-center bg-white rounded-2xl">
        {/* Header */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-[-20px]"
            >
              <div className="w-full h-full border-4 border-dashed border-yellow-400 rounded-full opacity-30" />
            </motion.div>
            <div className="bg-yellow-400 p-6 rounded-full shadow-lg relative z-10">
              <Award size={64} className="text-yellow-900" />
            </div>
            <div className="absolute top-0 right-[-10px] text-yellow-500 animate-bounce">
              <Star fill="currentColor" size={24} />
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-black text-slate-800 mb-2 uppercase tracking-tighter">
          Sertifikat Penghargaan
        </h1>
        <p className="text-lg font-bold text-blue-600 mb-10 uppercase tracking-widest">
          Pahlawan Literasi Digital
        </p>

        <p className="text-slate-500 italic mb-4">Diberikan dengan bangga kepada:</p>
        <h2 className="text-5xl font-black text-slate-900 mb-8 font-serif decoration-blue-600 underline decoration-4 underline-offset-8">
          {studentName}
        </h2>

        <p className="max-w-2xl mx-auto text-slate-600 mb-12 text-lg">
          Telah berhasil menyelesaikan misi <strong>"{questTitle}"</strong> dengan nilai yang sangat membanggakan di SmartLibrary SD Negeri Tempurejo 1.
        </p>

        <div className="flex justify-between items-end mt-20">
          <div className="text-left">
            <div className="w-48 h-px bg-slate-300 mb-2" />
            <p className="font-bold text-slate-800">Sistem Pintar Library</p>
            <p className="text-xs text-slate-400">ID: CERT-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-800 italic">{date}</p>
            <p className="text-xs text-slate-400">Tanggal Penyelesaian</p>
          </div>
        </div>
      </div>

      {/* Action Buttons (Floating) */}
      <div className="absolute top-6 right-6 flex gap-2">
        <button className="p-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors shadow-sm">
          <Download size={20} />
        </button>
        <button className="p-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors shadow-sm">
          <Share2 size={20} />
        </button>
      </div>
    </motion.div>
  );
}
