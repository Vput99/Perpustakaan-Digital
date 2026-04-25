/**
 * KantinAdmin - Halaman Kantin Sehat
 * Allows admin to search students and exchange coins for healthy snacks/drinks.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Coins, Cookie, CupSoda, ArrowLeft, CheckCircle, XCircle, Sparkles, ShoppingBag, History } from 'lucide-react';
import { useSmartSchool } from '../context/SmartSchoolContext';
import type { Student, TransactionLog } from '../types';

interface KantinAdminProps {
  onBack: () => void;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface StudentCardProps {
  key?: React.Key;
  student: Student;
  index: number;
  onExchange: (student: Student, amount: number, item: string) => void;
}

interface TransactionItemProps {
  key?: React.Key;
  log: TransactionLog;
  studentName: string;
}

export default function KantinAdmin({ onBack }: KantinAdminProps) {
  const { searchStudents, updateStudentCoins, transactionLogs, students } = useSmartSchool();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Student[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.trim()) {
      setResults(searchStudents(query));
    } else {
      setResults([]);
    }
  }, [query, searchStudents, students]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = `toast_${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const handleExchange = (student: Student, amount: number, item: string) => {
    const success = updateStudentCoins(student.id, -amount, `Tukar ${amount} koin untuk ${item}`);
    if (success) {
      addToast(`✅ ${student.name} menukar ${amount} koin untuk ${item}!`, 'success');
    } else {
      addToast(`❌ Koin ${student.name} tidak cukup! (Saldo: ${student.coins})`, 'error');
    }
  };

  const recentLogs = transactionLogs
    .filter(l => l.amount < 0)
    .slice(0, 15);

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'Unknown';

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, -30, 0], rotate: [0, 20, -20, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-[8%] text-7xl opacity-15"
        >🍎</motion.div>
        <motion.div
          animate={{ y: [0, 25, 0], x: [0, 15, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] right-[5%] text-8xl opacity-10"
        >🥛</motion.div>
        <motion.div
          animate={{ y: [0, -35, 0], rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[20%] left-[3%] text-6xl opacity-15"
        >🍪</motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[40%] right-[8%] text-7xl opacity-10"
        >🧃</motion.div>
      </div>

      {/* Toast notifications */}
      <div className="fixed top-6 right-6 z-[200] space-y-3">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              className={`px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm backdrop-blur-sm max-w-sm ${
                toast.type === 'success'
                  ? 'bg-emerald-500/95 text-white shadow-emerald-200'
                  : 'bg-rose-500/95 text-white shadow-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                <span>{toast.message}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-orange-100/50 border-2 border-white/60"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1, x: -3 }}
                whileTap={{ scale: 0.9 }}
                onClick={onBack}
                className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 hover:bg-orange-200 transition-colors"
              >
                <ArrowLeft size={22} />
              </motion.button>
              <div>
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <ShoppingBag size={24} className="text-orange-500" />
                  </motion.div>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-800">Kantin Sehat</h1>
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-2xl"
                  >🍏</motion.span>
                </div>
                <p className="text-sm font-medium text-slate-400 mt-0.5">Tukar koin prestasi dengan snack sehat!</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHistory(!showHistory)}
              className={`hidden md:flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
                showHistory
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                  : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
              }`}
            >
              <History size={16} />
              Riwayat
            </motion.button>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-orange-100/50 border-2 border-white/60"
        >
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
            Cari Siswa
          </label>
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute left-5 top-1/2 -translate-y-1/2"
            >
              <Search size={20} className="text-orange-400" />
            </motion.div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ketik nama atau nomor absen..."
              className="w-full h-14 bg-slate-50/80 rounded-2xl pl-14 pr-6 border-2 border-slate-100 focus:border-orange-400 focus:bg-white focus:outline-none font-bold text-slate-800 transition-all placeholder:text-slate-300"
              id="kantin-search"
            />
            {query && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-300 transition-colors"
              >
                <XCircle size={16} />
              </motion.button>
            )}
          </div>

          {/* Quick stats */}
          <div className="mt-4 flex gap-3">
            <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl">
              <Coins size={14} className="text-amber-500" />
              <span className="text-xs font-bold text-amber-700">{students.reduce((a, s) => a + s.coins, 0)} total koin</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl">
              <Sparkles size={14} className="text-blue-500" />
              <span className="text-xs font-bold text-blue-700">{students.length} siswa aktif</span>
            </div>
          </div>
        </motion.div>

        {/* Results / Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Cards */}
          <div className={`${showHistory ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
            <AnimatePresence mode="popLayout">
              {query && results.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 text-center border-2 border-white/60"
                >
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-black text-slate-700 mb-2">Siswa Tidak Ditemukan</h3>
                  <p className="text-slate-400 font-medium">Coba cari dengan nama atau nomor absen lain.</p>
                </motion.div>
              )}

              {!query && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 text-center border-2 border-white/60"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-7xl mb-4"
                  >🏪</motion.div>
                  <h3 className="text-xl font-black text-slate-700 mb-2">Selamat Datang di Kantin Sehat!</h3>
                  <p className="text-slate-400 font-medium">Cari nama siswa untuk memulai transaksi.</p>
                </motion.div>
              )}

              {results.map((student, idx) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  index={idx}
                  onExchange={handleExchange}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Transaction History Panel */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="lg:col-span-1"
              >
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border-2 border-white/60 sticky top-6">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <History size={14} />
                    Riwayat Penukaran
                  </h3>
                  {recentLogs.length === 0 ? (
                    <p className="text-sm text-slate-400 font-medium text-center py-6">Belum ada transaksi</p>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {recentLogs.map((log) => (
                        <TransactionItem key={log.id} log={log} studentName={getStudentName(log.student_id)} />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function StudentCard({ student, index, onExchange }: StudentCardProps) {
  const coinColor = student.coins >= 10
    ? 'text-emerald-600 bg-emerald-50'
    : student.coins >= 5
    ? 'text-amber-600 bg-amber-50'
    : 'text-rose-600 bg-rose-50';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.08 }}
      className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-orange-100/30 border-2 border-white/60 hover:shadow-xl transition-shadow"
    >
      <div className="flex items-center gap-5">
        {/* Student Photo */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="shrink-0"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-200 to-amber-100 p-1 shadow-md shadow-orange-100">
            <img
              src={student.photo_url}
              alt={student.name}
              className="w-full h-full rounded-xl object-cover bg-white"
            />
          </div>
        </motion.div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-slate-100 px-2.5 py-0.5 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
              No. {student.absen}
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-800 truncate">{student.name}</h3>
          <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full font-black text-sm ${coinColor}`}>
            <Coins size={14} />
            {student.coins} Koin
          </div>
        </div>

        {/* Actions */}
        <div className="shrink-0 flex flex-col gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onExchange(student, 5, 'Snack Sehat')}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl text-white font-bold text-sm shadow-md shadow-amber-100 hover:shadow-lg hover:shadow-amber-200 transition-all"
          >
            <Cookie size={16} />
            <span className="hidden sm:inline">Snack</span>
            <span className="bg-white/25 px-2 py-0.5 rounded-full text-xs font-black">5🪙</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onExchange(student, 10, 'Minuman Sehat')}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-sky-400 to-blue-500 rounded-2xl text-white font-bold text-sm shadow-md shadow-blue-100 hover:shadow-lg hover:shadow-blue-200 transition-all"
          >
            <CupSoda size={16} />
            <span className="hidden sm:inline">Minum</span>
            <span className="bg-white/25 px-2 py-0.5 rounded-full text-xs font-black">10🪙</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function TransactionItem({ log, studentName }: TransactionItemProps) {
  const time = new Date(log.timestamp);
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50/80 rounded-xl">
      <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
        {log.description.includes('Snack') ? <Cookie size={14} className="text-rose-500" /> : <CupSoda size={14} className="text-blue-500" />}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-700 truncate">{studentName}</p>
        <p className="text-xs text-slate-400 font-medium">{log.description}</p>
        <p className="text-[10px] text-slate-300 font-bold mt-0.5">
          {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <span className="text-sm font-black text-rose-500 shrink-0 ml-auto">{log.amount}</span>
    </div>
  );
}
