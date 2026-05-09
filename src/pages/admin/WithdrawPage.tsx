import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Coins, 
  ArrowLeft, 
  ChevronRight, 
  X, 
  Filter, 
  TrendingDown, 
  History,
  CheckCircle,
  AlertCircle,
  LogOut,
  ShieldCheck,
  CreditCard,
  Banknote,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSmartSchool } from '../../context/SmartSchoolContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { collection, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';

export default function WithdrawPage() {
  const { students, updateStudentCoins, profile, showToast } = useSmartSchool();
  const [selectedClass, setSelectedClass] = useState<number | 'Semua'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawReason, setWithdrawReason] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const navigate = useNavigate();

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchClass = selectedClass === 'Semua' || s.class?.toString() === selectedClass.toString();
      const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.nisn && s.nisn.includes(searchQuery));
      return matchClass && matchSearch;
    });
  }, [students, selectedClass, searchQuery]);

  useEffect(() => {
    fetchRecentWithdrawals();
  }, [students]);

  const fetchRecentWithdrawals = async () => {
    try {
      const q = query(
        collection(db, 'transactions'),
        where('type', '==', 'redeem'),
        orderBy('created_at', 'desc'),
        limit(15)
      );
      const snap = await getDocs(q);
      const trans = await Promise.all(snap.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const student = students.find(s => s.id === data.student_id);
        return {
          id: docSnap.id,
          ...data,
          studentName: student?.name || 'Siswa',
          timestamp: data.created_at instanceof Timestamp ? data.created_at.toDate() : new Date()
        };
      }));
      setRecentTransactions(trans);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedStudent || !withdrawAmount || isNaN(Number(withdrawAmount))) {
      showToast("Pilih siswa dan masukkan jumlah koin!", "error");
      return;
    }

    const amount = Number(withdrawAmount);
    if (amount <= 0) {
      showToast("Jumlah harus lebih dari 0!", "error");
      return;
    }

    if (selectedStudent.coins < amount) {
      showToast("Saldo koin tidak mencukupi!", "error");
      return;
    }

    setIsProcessing(true);
    try {
      const success = await updateStudentCoins(
        selectedStudent.id, 
        -amount, 
        withdrawReason || "Penarikan Koin"
      );

      if (success) {
        showToast(`Berhasil menarik ${amount} koin!`, "success");
        setSelectedStudent(null);
        setWithdrawAmount('');
        setWithdrawReason('');
        fetchRecentWithdrawals();
      } else {
        showToast("Gagal memproses penarikan.", "error");
      }
    } catch (err) {
      showToast("Kesalahan sistem.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div 
      className="min-h-screen relative font-pixel-body text-slate-800 overflow-x-hidden bg-fixed bg-cover bg-center"
      style={{ backgroundImage: "url('/pixel_adventure_bg_1777815985861.png')" }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-white/5 pointer-events-none z-0" />

      <div className="relative z-10 flex min-h-screen">
        {/* Slim Sidebar */}
        <motion.aside 
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          className="w-24 hidden md:flex flex-col items-center py-10 gap-10 bg-white border-r border-slate-200 shadow-xl"
        >
          <div className="w-14 h-14 bg-slate-50 flex items-center justify-center text-slate-900 shadow-lg border-2 border-slate-100 p-2">
            <ShieldCheck size={32} />
          </div>
          <nav className="flex flex-col gap-8 mt-10">
            <button 
              onClick={() => navigate('/admin')} 
              className="w-14 h-14 flex items-center justify-center rounded-2xl text-slate-400 hover:text-slate-900 transition-all group relative"
            >
              <Users size={28} />
              <span className="absolute left-full ml-4 px-3 py-1.5 scifi-panel-blue text-slate-900 text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50">Dashboard</span>
            </button>
            <button 
              className="w-14 h-14 flex items-center justify-center text-slate-900 shadow-lg"
              style={{ backgroundImage: "url('/kenney_ui-pack-pixel-adventure/Tiles/Large tiles/Thick outline/tile_0002.png')", backgroundSize: '100% 100%' }}
            >
              <Banknote size={28} className="text-white" />
            </button>
          </nav>
          <button 
            onClick={handleLogout} 
            className="w-14 h-14 flex items-center justify-center scifi-button-red text-white transition-all mt-auto"
          >
            <LogOut size={24} />
          </button>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 lg:p-14 overflow-y-auto max-h-screen custom-scrollbar">
          {/* Header Section */}
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl pixel-font-header text-slate-900 mb-3 drop-shadow-sm">
                MASTER EXCHANGE <span className="text-amber-600">GP</span>
              </h1>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] pixel-font-body">
                Sistem Otorisasi Transaksi • Merchant Gild
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-6 pixel-panel-blue px-10 py-5 shadow-xl"
            >
              <div className="text-right">
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest leading-none mb-1 pixel-font-body">Total Saldo Gild</p>
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-xl font-bold text-white pixel-font-header">{students.reduce((a, s) => a + (s.coins || 0), 0)}</span>
                  <Coins size={24} className="text-amber-400" />
                </div>
              </div>
            </motion.div>
          </header>

          <div className="grid grid-cols-12 gap-8">
            {/* List & Search */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pixel-panel p-8 shadow-xl overflow-hidden relative group"
              >
                <div className="flex flex-col xl:flex-row gap-6 mb-10 relative z-10">
                  <div className="flex-1 relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={24} />
                    <input 
                      type="text" 
                      placeholder="Cari nama siswa..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-16 bg-black/5 rounded-[1.5rem] pl-16 pr-8 border border-black/10 focus:border-blue-400 focus:bg-black/10 focus:outline-none font-black text-slate-900 transition-all placeholder:text-slate-400 font-outfit"
                    />
                  </div>
                  <div className="flex bg-black/20 p-1.5 rounded-[1.5rem] gap-1 overflow-x-auto no-scrollbar">
                    {['Semua', 1, 2, 3, 4, 5, 6].map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedClass(c as any)}
                        className={`px-6 py-3 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap pixel-font-body ${
                          selectedClass === c 
                          ? 'bg-amber-600 text-white shadow-xl' 
                          : 'text-slate-400 hover:text-slate-800'
                        }`}
                      >
                        {c === 'Semua' ? 'SEMUA' : `KELAS ${c}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar relative z-10">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student, idx) => (
                      <motion.div
                        layout
                        key={student.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => setSelectedStudent(student)}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-6 border transition-all cursor-pointer flex items-center justify-between ${
                          selectedStudent?.id === student.id
                          ? 'pixel-panel-blue scale-[1.02] shadow-lg'
                          : 'bg-white border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-5">
                          <div className="relative">
                            <img 
                              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${student.name}`} 
                              alt="Avatar" 
                              className="w-16 h-16 rounded-2xl bg-white/10 p-1 border border-white/20"
                            />
                            <div className="absolute -top-2 -right-2 w-7 h-7 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center text-[10px] font-black text-white border border-white/20">
                              {student.class}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-bold scifi-text-cyan text-lg leading-tight mb-1 font-outfit">{student.name}</h3>
                            <p className="text-[9px] font-bold text-blue-300 uppercase tracking-[0.2em] font-scifi">Absen {student.absen}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 font-bold text-amber-600 bg-black/5 px-4 py-2 rounded-xl border border-black/5">
                            <span className="text-2xl tracking-tighter leading-none font-scifi">{student.coins || 0}</span>
                            <Coins size={18} />
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-2 py-20 text-center">
                      <p className="text-white/20 font-black text-xl italic uppercase tracking-widest">Siswa tidak ditemukan</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Withdraw Panel */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
              <AnimatePresence mode="wait">
                {selectedStudent ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="scifi-panel-glass p-10 shadow-2xl relative overflow-hidden"
                  >
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-rose-500 to-orange-500" />
                    <button onClick={() => setSelectedStudent(null)} className="absolute top-6 right-6 p-2.5 bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-600 transition-colors">
                      <X size={24} />
                    </button>

                    <div className="text-center mb-10">
                      <div className="relative inline-block mb-6">
                        <img 
                          src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedStudent.name}`} 
                          className="w-32 h-32 rounded-[2rem] border-4 border-slate-100 bg-white shadow-lg" 
                          alt="" 
                        />
                        <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-white">
                          <Coins size={24} />
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2 pixel-font-body">Konfirmasi Penukaran</p>
                      <h2 className="text-xl font-bold text-slate-800 leading-none pixel-font-header">{selectedStudent.name}</h2>
                      <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-black/5 border border-black/10">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pixel-font-body">Saldo:</span>
                        <span className="text-sm font-bold text-slate-800 pixel-font-body">{selectedStudent.coins} GP</span>
                      </div>
                    </div>

                      <div className="space-y-8">
                        <div className="space-y-3">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4 pixel-font-body">Jumlah Tukar (GP)</label>
                          <div className="relative group">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-50 text-amber-600 rounded-xl flex items-center justify-center">
                              <Coins size={24} />
                            </div>
                            <input 
                              type="number" 
                              placeholder="0"
                              value={withdrawAmount}
                              onChange={(e) => setWithdrawAmount(e.target.value)}
                              className="w-full h-20 bg-black/5 rounded-[1.8rem] pl-20 pr-8 border-2 border-transparent focus:border-amber-400 focus:bg-black/10 focus:outline-none font-bold text-4xl text-amber-600 transition-all placeholder:text-slate-200 pixel-font-body"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4 pixel-font-body">Keterangan Barang</label>
                          <input 
                            type="text" 
                            placeholder="Misal: Pensil, Jajanan..."
                            value={withdrawReason}
                            onChange={(e) => setWithdrawReason(e.target.value)}
                            className="w-full h-16 bg-black/5 rounded-[1.5rem] px-8 border-2 border-transparent focus:border-blue-400 focus:bg-black/10 focus:outline-none font-bold text-slate-800 transition-all placeholder:text-slate-200 pixel-font-body"
                          />
                        </div>

                        <button
                          onClick={handleWithdraw}
                          disabled={isProcessing}
                          className="pixel-button-red w-full h-20 text-xl"
                        >
                          {isProcessing ? (
                            <Loader2 className="animate-spin" size={28} />
                          ) : (
                            'PROSES TUKAR'
                          )}
                        </button>
                      </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white/5 backdrop-blur-3xl rounded-[3.5rem] p-16 border border-white/10 text-center flex flex-col items-center justify-center"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10"
                    >
                      <TrendingDown size={48} className="text-white/20" />
                    </motion.div>
                    <h3 className="text-2xl font-black text-white/40 mb-3">Siap Menarik Koin?</h3>
                    <p className="text-white/20 font-bold text-sm leading-relaxed">
                      Pilih siswa dari daftar untuk memproses <br /> penukaran koin prestasi mereka.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recent Activity Card */}
              <div className="pixel-panel p-10 shadow-xl overflow-hidden relative">
                <h2 className="text-sm pixel-font-header text-slate-800 flex items-center gap-4 mb-8 relative z-10">
                  <div className="w-10 h-10 bg-blue-500/10 border-2 border-blue-500/20 text-blue-600 flex items-center justify-center">
                    <History size={22} />
                  </div>
                  AKTIVITAS TERBARU
                </h2>
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                  {recentTransactions.map((tx, idx) => (
                    <motion.div 
                      key={tx.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-5 bg-black/5 border-2 border-black/5 flex items-center justify-between group hover:bg-black/10 transition-colors pixel-font-body"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <TrendingDown size={22} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm leading-tight truncate mb-1">{tx.studentName}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{tx.description}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-rose-600 text-lg">-{tx.amount} GP</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase">
                          {tx.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {recentTransactions.length === 0 && (
                    <p className="text-center text-slate-400 py-10 font-bold italic pixel-font-body">Belum ada transaksi</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
