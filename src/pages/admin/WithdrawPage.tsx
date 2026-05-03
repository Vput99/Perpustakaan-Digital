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
    <div className="min-h-screen relative font-nunito text-slate-800 overflow-x-hidden bg-slate-900">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Slim Sidebar */}
        <motion.aside 
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          className="w-24 hidden md:flex flex-col items-center py-10 gap-10 bg-white/5 backdrop-blur-3xl border-r border-white/10"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[1.2rem] flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <ShieldCheck size={32} />
          </div>
          <nav className="flex flex-col gap-8 mt-10">
            <button onClick={() => navigate('/admin')} className="p-4 rounded-2xl text-white/40 hover:text-white hover:bg-white/10 transition-all group relative">
              <Users size={28} />
              <span className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50">Dashboard Guru</span>
            </button>
            <button className="p-4 rounded-2xl bg-white/10 text-white shadow-lg shadow-black/20 ring-1 ring-white/20">
              <Banknote size={28} />
            </button>
            <button onClick={() => navigate('/')} className="p-4 rounded-2xl text-white/40 hover:text-white hover:bg-white/10 transition-all group relative">
              <Search size={28} />
              <span className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50">Cari Buku</span>
            </button>
          </nav>
          <button onClick={handleLogout} className="p-4 rounded-2xl text-rose-400/60 hover:text-rose-400 hover:bg-rose-400/10 transition-all mt-auto">
            <LogOut size={28} />
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
              <h1 className="text-5xl font-black text-white tracking-tighter mb-3 drop-shadow-md">
                Pusat Withdraw <span className="text-blue-400">Koin</span>
              </h1>
              <p className="text-blue-200/60 font-black uppercase tracking-[0.3em] text-[10px]">
                Admin Master Control • SD Negeri Tempurejo 1
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-6 bg-white/5 backdrop-blur-2xl px-8 py-5 rounded-[2.5rem] border border-white/10 shadow-2xl"
            >
              <div className="text-right">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Total Saldo Siswa</p>
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-3xl font-black text-white">{students.reduce((a, s) => a + (s.coins || 0), 0)}</span>
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
                className="bg-white/5 backdrop-blur-3xl rounded-[3.5rem] p-8 border border-white/10 shadow-2xl overflow-hidden relative group"
              >
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-500/20 transition-colors" />
                
                <div className="flex flex-col xl:flex-row gap-6 mb-10 relative z-10">
                  <div className="flex-1 relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={24} />
                    <input 
                      type="text" 
                      placeholder="Cari nama siswa..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-16 bg-white/5 rounded-[1.5rem] pl-16 pr-8 border border-white/10 focus:border-blue-400 focus:bg-white/10 focus:outline-none font-black text-white transition-all placeholder:text-white/20"
                    />
                  </div>
                  <div className="flex bg-black/20 p-1.5 rounded-[1.5rem] gap-1 overflow-x-auto no-scrollbar">
                    {['Semua', 1, 2, 3, 4, 5, 6].map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedClass(c as any)}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all whitespace-nowrap ${
                          selectedClass === c 
                          ? 'bg-white text-slate-900 shadow-xl' 
                          : 'text-white/40 hover:text-white/70'
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
                        whileHover={{ scale: 1.02, y: -4, backgroundColor: 'rgba(255,255,255,0.08)' }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-6 rounded-[2rem] border transition-all cursor-pointer flex items-center justify-between ${
                          selectedStudent?.id === student.id
                          ? 'bg-blue-600/20 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                          : 'bg-white/5 border-white/10'
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
                            <h3 className="font-black text-white text-lg leading-tight mb-1">{student.name}</h3>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Absen {student.absen}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 font-black text-amber-400 bg-amber-400/10 px-4 py-2 rounded-xl border border-amber-400/20">
                            <span className="text-2xl tracking-tighter leading-none">{student.coins || 0}</span>
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
                    className="bg-white rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden"
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
                          className="w-32 h-32 rounded-[2.5rem] border-4 border-slate-50 bg-slate-50 shadow-xl" 
                          alt="" 
                        />
                        <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-white">
                          <Coins size={24} />
                        </div>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Konfirmasi Penarikan</p>
                      <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none">{selectedStudent.name}</h2>
                      <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Saldo Saat Ini:</span>
                        <span className="text-sm font-black text-amber-600">{selectedStudent.coins} Koin</span>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Jumlah Withdraw</label>
                        <div className="relative group">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                            <Banknote size={24} />
                          </div>
                          <input 
                            type="number" 
                            placeholder="0"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className="w-full h-20 bg-slate-50 rounded-[1.8rem] pl-20 pr-8 border-2 border-transparent focus:border-rose-400 focus:bg-white focus:outline-none font-black text-4xl text-rose-600 transition-all placeholder:text-slate-200"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Keterangan / Item</label>
                        <input 
                          type="text" 
                          placeholder="Misal: Tukar Pensil, Penghapus..."
                          value={withdrawReason}
                          onChange={(e) => setWithdrawReason(e.target.value)}
                          className="w-full h-16 bg-slate-50 rounded-[1.5rem] px-8 border-2 border-transparent focus:border-blue-400 focus:bg-white focus:outline-none font-bold text-slate-700 transition-all"
                        />
                      </div>

                      <button
                        onClick={handleWithdraw}
                        disabled={isProcessing}
                        className="w-full h-20 bg-rose-600 text-white rounded-[2rem] font-black text-xl shadow-[0_15px_40px_-10px_rgba(225,29,72,0.4)] hover:bg-rose-700 hover:translate-y-[-4px] active:translate-y-[2px] transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:translate-y-0"
                      >
                        {isProcessing ? (
                          <Loader2 className="animate-spin" size={28} />
                        ) : (
                          <>Proses Tarik <CreditCard size={28} /></>
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
              <div className="bg-black/40 backdrop-blur-3xl rounded-[3.5rem] p-10 border border-white/10 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px]" />
                <h2 className="text-xl font-black text-white flex items-center gap-4 mb-8 relative z-10">
                  <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
                    <History size={22} />
                  </div>
                  Aktivitas Terbaru
                </h2>
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                  {recentTransactions.map((tx, idx) => (
                    <motion.div 
                      key={tx.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-5 bg-white/5 rounded-[1.5rem] border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <TrendingDown size={22} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-white text-sm leading-tight truncate mb-1">{tx.studentName}</p>
                          <p className="text-[10px] text-white/30 font-black uppercase tracking-widest truncate">{tx.description}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black text-rose-400 text-lg">-{tx.amount}</p>
                        <p className="text-[8px] text-white/20 font-black uppercase">
                          {tx.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {recentTransactions.length === 0 && (
                    <p className="text-center text-white/20 py-10 font-bold italic">Belum ada transaksi</p>
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
