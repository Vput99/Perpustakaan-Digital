import { Users, ShieldAlert, ListChecks, CheckCircle2, ShoppingBag, BookOpen, Clock, X, ChevronRight, Loader2, Plus, LogOut, Send, PenTool, SendHorizonal, Paperclip, Settings, Award, Banknote } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import KantinAdmin from '../components/KantinAdmin';
import MissionCreator from './admin/MissionCreator';
import { useSmartSchool } from '../context/SmartSchoolContext';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

export default function AdminView() {
  const { students: contextStudents, profile, loading } = useSmartSchool();
  const [view, setView] = useState<'admin' | 'kantin' | 'create_mission'>('admin');
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const navigate = useNavigate();
  const [readingHistory, setReadingHistory] = useState<any[]>([]);
  const [studentQuests, setStudentQuests] = useState<any[]>([]);
  const [studentCerts, setStudentCerts] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'riwayat' | 'misi'>('riwayat');
  const [showToast, setShowToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const handleAssignMission = async (title: string, reward: number, icon: string) => {
    try {
      await addDoc(collection(db, 'quests'), {
        title,
        reward,
        icon,
        target_class: profile?.class || 'Semua',
        created_at: serverTimestamp()
      });

      setShowToast({ message: `Misi "${title}" berhasil ditugaskan!`, type: 'success' });
      setTimeout(() => setShowToast(null), 3000);
    } catch (err: any) {
      setShowToast({ message: 'Gagal menugaskan misi: ' + err.message, type: 'error' });
      setTimeout(() => setShowToast(null), 3000);
    }
  };

  useEffect(() => {
    if (selectedStudent) {
      const fetchData = async () => {
        setLoadingHistory(true);
        try {
          const [historyRes, questsRes, certsRes] = await Promise.all([
            getDocs(query(collection(db, 'borrow_history'), where('student_id', '==', selectedStudent.id), orderBy('created_at', 'desc'), limit(10))),
            getDocs(query(collection(db, 'quests'), where('target_class', 'in', [selectedStudent.class?.toString(), 'Semua']))),
            getDocs(query(collection(db, 'certificates'), where('student_id', '==', selectedStudent.id), orderBy('created_at', 'desc')))
          ]);

          setReadingHistory(historyRes.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            created_at: doc.data().created_at instanceof Timestamp ? doc.data().created_at.toDate().toISOString() : doc.data().created_at
          })));

          setStudentQuests(questsRes.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setStudentCerts(certsRes.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
          console.error("Error fetching student details:", error);
        } finally {
          setLoadingHistory(false);
        }
      };
      fetchData();
    }
  }, [selectedStudent]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const teacherClass = profile?.class;

  const filteredStudents = teacherClass
    ? contextStudents.filter(s => s.class === teacherClass.toString())
    : (selectedClass
        ? contextStudents.filter(s => s.class === selectedClass.toString())
        : contextStudents);

  if (view === 'create_mission') {
    return (
      <MissionCreator 
        onBack={() => setView('admin')} 
        targetClass={profile?.class}
        onSuccess={(msg) => {
          setShowToast({ message: msg, type: 'success' });
          setTimeout(() => setShowToast(null), 3000);
        }} 
      />
    );
  }

  if (view === 'kantin') {
    return <KantinAdmin onBack={() => setView('admin')} />;
  }

  return (
    <div 
      className="min-h-screen p-6 md:p-12 relative overflow-hidden font-nunito bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/Background Guru.png")' }}
    >
      {/* 3D Background Elements - Overlay to enhance the image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Subtle Darkening Overlay if needed */}
        <div className="absolute inset-0 bg-white/10" />

        {/* 3D Assets Mockup (Floating Icons) */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-[15%] left-[8%] text-[#6366f1]/20"
        >
          <PenTool size={120} style={{ transform: 'perspective(500px) rotateY(-20deg)' }} />
        </motion.div>

        <motion.div 
          animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-[20%] right-[10%] text-[#f59e0b]/20"
        >
          <Settings size={140} style={{ transform: 'perspective(500px) rotateX(20deg)' }} />
        </motion.div>

        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, -20, 0], rotate: [-10, 10, -10] }}
          transition={{ duration: 7, repeat: Infinity }}
          className="absolute top-[60%] left-[12%] text-slate-400/20"
        >
          <Paperclip size={80} />
        </motion.div>

        <motion.div 
          animate={{ y: [0, -50, 0], x: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-[10%] right-[15%] text-slate-300/30"
        >
          <SendHorizonal size={100} />
        </motion.div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl font-black text-sm text-white ${showToast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}
          >
            {showToast.type === 'success' ? '✅ ' : '❌ '} {showToast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Glass Panel with 3D Depth */}
        <div className="bg-white/40 backdrop-blur-3xl rounded-[3rem] border border-white/50 shadow-[0_40px_100px_-12px_rgba(0,0,0,0.15)] overflow-hidden p-8 md:p-10 space-y-8">
          
          {/* Header Row - 3D Container */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white/70 p-6 rounded-[2.5rem] shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05)] border border-white/80">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-[1.5rem] bg-[#FCE8E8] text-[#E15A5A] flex items-center justify-center shadow-[0_8px_0_0_#E15A5A20,0_15px_30px_-5px_#E15A5A30] border-b-4 border-[#E15A5A10]">
                <ShieldAlert size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-[#2D3748] tracking-tight">
                  {teacherClass ? `Dashboard Guru Kelas ${teacherClass}` : 'Dashboard Admin'}
                </h1>
                <p className="text-sm font-bold text-[#718096]">
                  {teacherClass ? `Mengelola siswa Kelas ${teacherClass}` : 'Pantau semua siswa dan berikan misi'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-5">
              {/* 3D Purple Button */}
              <motion.button 
                whileHover={{ y: -2 }}
                whileTap={{ y: 8, boxShadow: 'none' }}
                onClick={() => setView('create_mission')}
                className="flex items-center gap-3 px-8 py-4 bg-[#5436D6] text-white rounded-[1.5rem] font-black transition-all shadow-[0_10px_0_0_#3B22A8,0_20px_30px_-10px_rgba(84,54,214,0.4)] border-b-2 border-[#FFFFFF20]"
              >
                <Plus size={22} />
                Buat Misi Baru
              </motion.button>

              {/* 3D Orange Button */}
              <motion.button 
                whileHover={{ y: -2 }}
                whileTap={{ y: 8, boxShadow: 'none' }}
                onClick={() => setView('kantin')}
                className="flex items-center gap-3 px-8 py-4 bg-[#E8833A] text-white rounded-[1.5rem] font-black transition-all shadow-[0_10px_0_0_#B86228,0_20px_30px_-10px_rgba(232,131,58,0.4)] border-b-2 border-[#FFFFFF20]"
              >
                <ShoppingBag size={22} />
                Buka Kantin Sehat
              </motion.button>

              {/* 3D Blue Button for Withdraw */}
              <motion.button 
                whileHover={{ y: -2 }}
                whileTap={{ y: 8, boxShadow: 'none' }}
                onClick={() => navigate('/admin/withdraw')}
                className="flex items-center gap-3 px-8 py-4 bg-[#3182CE] text-white rounded-[1.5rem] font-black transition-all shadow-[0_10px_0_0_#2A69AC,0_20px_30px_-10px_rgba(49,130,206,0.4)] border-b-2 border-[#FFFFFF20]"
              >
                <Banknote size={22} />
                Withdraw Koin
              </motion.button>

              {/* 3D Logout Button */}
              <motion.button 
                whileHover={{ y: -2 }}
                whileTap={{ y: 6, boxShadow: 'none' }}
                onClick={handleLogout}
                className="flex items-center gap-3 px-8 py-4 bg-white text-[#4A5568] rounded-[1.5rem] font-black transition-all border border-[#E2E8F0] shadow-[0_8px_0_0_#EDF2F7,0_15px_20px_-5px_rgba(0,0,0,0.05)]"
              >
                <LogOut size={22} />
                Keluar
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Section: Student Data Panel - 3D Look */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-8 bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] flex flex-col min-h-[500px]"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-[#2D3748] flex items-center gap-3">
                  <Users className="text-[#4299E1]" size={28} /> Data Siswa {teacherClass ? `Kelas ${teacherClass}` : ''}
                </h2>
                {!teacherClass && (
                  <div className="flex bg-[#EDF2F7] p-1.5 rounded-full shadow-inner">
                    <button
                      onClick={() => setSelectedClass(null)}
                      className={`px-4 py-2 rounded-full text-xs font-black transition-all ${!selectedClass ? 'bg-white text-[#3182CE] shadow-md' : 'text-[#A0AEC0]'}`}
                    >
                      SEMUA
                    </button>
                    {[1, 2, 3, 4, 5, 6].map(c => (
                      <button
                        key={c}
                        onClick={() => setSelectedClass(c)}
                        className={`px-4 py-2 rounded-full text-xs font-black transition-all ${selectedClass === c ? 'bg-white text-[#3182CE] shadow-md' : 'text-[#A0AEC0]'}`}
                      >
                        KLS {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {filteredStudents.length > 0 ? (
                  <div className="grid grid-cols-1 gap-5">
                    {filteredStudents.map(student => (
                      <motion.div 
                        layout
                        key={student.id} 
                        onClick={() => setSelectedStudent(student)}
                        whileHover={{ scale: 1.01, x: 8 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center justify-between p-5 rounded-[2rem] border transition-all cursor-pointer ${selectedStudent?.id === student.id ? 'bg-[#EBF8FF] border-[#BEE3F8] shadow-[0_12px_0_0_#BEE3F8,0_20px_30px_-10px_rgba(66,153,225,0.2)] -translate-y-1' : 'bg-white border-white/80 hover:bg-white hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-1'}`}
                      >
                        <div className="flex items-center gap-5">
                          <div className="relative">
                            <img 
                              src={student.photo_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${student.full_name}`} 
                              alt="avatar" 
                              className="w-16 h-16 rounded-[1.2rem] bg-white border-2 border-white shadow-md" 
                            />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#48BB78] border-4 border-[#EBF8FF] rounded-full" />
                          </div>
                          <div>
                            <h3 className="font-black text-[#2D3748] text-xl leading-tight">{student.full_name || student.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-3 py-1 bg-[#EDF2F7] rounded-lg text-[10px] font-black text-[#718096] uppercase tracking-widest">NISN: {student.nisn || student.id.slice(0, 8)}</span>
                              <span className="text-[10px] font-black text-[#48BB78] uppercase tracking-widest">AKTIF</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div className="px-5 py-2.5 bg-white rounded-2xl shadow-sm border border-slate-50">
                            <div className="flex items-center gap-1.5 text-[#D69E2E] font-black">
                              <span className="text-2xl tracking-tighter">{student.coins || 0}</span>
                              <span className="text-xs">KOIN</span>
                            </div>
                          </div>
                          <ChevronRight size={24} className="text-[#CBD5E0]" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-[#A0AEC0] space-y-4 py-20">
                    <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center shadow-inner border border-white">
                      <Users size={48} className="opacity-40" />
                    </div>
                    <p className="text-xl font-black opacity-40 italic">Tidak ada siswa ditemukan.</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right Section: Action Panel - 3D Look */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <AnimatePresence mode="wait">
                {selectedStudent ? (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    className="bg-[#EDFDFD]/90 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] flex-1 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex bg-white/50 p-1 rounded-2xl border border-[#B2F5EA]">
                        <button
                          onClick={() => setActiveDetailTab('riwayat')}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeDetailTab === 'riwayat' ? 'bg-[#319795] text-white shadow-lg' : 'text-[#319795] hover:bg-white/50'}`}
                        >
                          RIWAYAT
                        </button>
                        <button
                          onClick={() => setActiveDetailTab('misi')}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeDetailTab === 'misi' ? 'bg-[#319795] text-white shadow-lg' : 'text-[#319795] hover:bg-white/50'}`}
                        >
                          MISI & TUGAS
                        </button>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedStudent(null)} 
                        className="p-2.5 bg-white rounded-xl text-[#319795] shadow-md border border-[#B2F5EA] transition-all"
                      >
                        <X size={20} />
                      </motion.button>
                    </div>

                    <div className="bg-white/80 p-5 rounded-[1.8rem] border border-[#B2F5EA] mb-6 shadow-md flex items-center gap-4">
                      <img 
                        src={selectedStudent.photo_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedStudent.full_name}`} 
                        alt="avatar" 
                        className="w-12 h-12 rounded-xl bg-white border border-slate-100" 
                      />
                      <div>
                        <p className="text-[10px] font-black text-[#319795] uppercase tracking-widest mb-0.5">SISWA TERPILIH</p>
                        <p className="text-xl font-black text-[#234E52] leading-tight">{selectedStudent.full_name || selectedStudent.name}</p>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                      {loadingHistory ? (
                        <div className="py-20 text-center">
                          <Loader2 className="animate-spin mx-auto text-[#319795] opacity-50" size={40} />
                        </div>
                      ) : activeDetailTab === 'riwayat' ? (
                        readingHistory.length > 0 ? (
                          readingHistory.map((h, i) => (
                            <motion.div 
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              key={i} 
                              className="p-5 bg-white border border-white rounded-[1.5rem] flex items-center gap-5 shadow-[0_4px_0_0_#E6FFFA,0_8px_15px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_0_0_#E6FFFA,0_12px_20px_-5px_rgba(0,0,0,0.08)] transition-all group"
                            >
                              <div className="w-12 h-12 bg-[#E6FFFA] text-[#319795] rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                                <BookOpen size={22} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-black text-[#234E52] text-base truncate leading-tight">{h.book_title}</p>
                                <div className="flex items-center gap-2 text-[10px] text-[#4FD1C5] font-black mt-1.5 uppercase">
                                  <Clock size={12} /> {new Date(h.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </div>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full opacity-30 text-[#319795] space-y-3 py-10">
                            <BookOpen size={60} />
                            <p className="text-lg font-black italic">Belum ada riwayat.</p>
                          </div>
                        )
                      ) : (
                        <div className="space-y-6">
                          {/* Section: Earned Certificates */}
                          <div>
                            <h3 className="text-xs font-black text-[#319795] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                              <Award size={14} /> Sertifikat Diperoleh ({studentCerts.length})
                            </h3>
                            {studentCerts.length > 0 ? (
                              <div className="space-y-3">
                                {studentCerts.map((cert, i) => (
                                  <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={i}
                                    className="p-4 bg-white/60 border border-amber-100 rounded-2xl flex items-center gap-4"
                                  >
                                    <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
                                      <Award size={20} />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-black text-[#234E52] text-sm truncate">{cert.quest_title}</p>
                                      <p className="text-[10px] font-bold text-amber-600 uppercase">{cert.date}</p>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs font-bold text-[#319795]/50 italic text-center py-4 bg-white/30 rounded-2xl border border-dashed border-[#B2F5EA]">Belum ada sertifikat.</p>
                            )}
                          </div>

                          {/* Section: Class Missions */}
                          <div>
                            <h3 className="text-xs font-black text-[#319795] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                              <ListChecks size={14} /> Misi Kelas Aktif
                            </h3>
                            {studentQuests.length > 0 ? (
                              <div className="space-y-3">
                                {studentQuests.map((q, i) => (
                                  <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={i}
                                    className="p-4 bg-white/40 border border-white rounded-2xl flex items-center justify-between gap-4"
                                  >
                                    <div className="flex items-center gap-4 min-w-0">
                                      <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center shrink-0 text-xl">
                                        {q.icon || '🎯'}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="font-black text-[#2D3748] text-sm truncate">{q.title}</p>
                                        <p className="text-[10px] font-bold text-indigo-500 uppercase">Hadiah: {q.reward} Koin</p>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs font-bold text-[#319795]/50 italic text-center py-4 bg-white/30 rounded-2xl border border-dashed border-[#B2F5EA]">Tidak ada misi kelas.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="missions"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] flex-1 flex flex-col"
                  >
                    <h2 className="text-2xl font-black text-[#2D3748] flex items-center gap-3 mb-8">
                      <ListChecks className="text-[#5436D6]" size={28} /> Berikan Misi
                    </h2>

                    <div className="space-y-6">
                      {/* Mission Card 1 - 3D Look */}
                      <motion.div 
                        whileHover={{ y: -8 }}
                        className="p-7 rounded-[2.2rem] bg-[#F5F3FF] border-2 border-white shadow-[0_12px_0_0_#DDD6FE,0_25px_30px_-10px_rgba(84,54,214,0.15)] relative overflow-hidden group"
                      >
                        <div className="relative z-10">
                          <h3 className="font-black text-[#4338CA] text-xl mb-1">Misi Membaca</h3>
                          <p className="text-sm font-bold text-[#6366F1] opacity-80 mb-6">Baca 2 buku cerita nusantara</p>
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ y: 8, boxShadow: 'none' }}
                            onClick={() => handleAssignMission('Misi Membaca Nusantara', 25, '📚')}
                            className="w-full py-4 bg-[#5436D6] text-white rounded-[1.2rem] font-black shadow-[0_8px_0_0_#3B22A8,0_15px_20px_-5px_rgba(84,54,214,0.4)] flex items-center justify-center gap-2 hover:bg-[#4429B8] transition-all"
                          >
                            <CheckCircle2 size={20} /> Tugaskan
                          </motion.button>
                        </div>
                        <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:scale-125 transition-transform text-[#5436D6]">
                          <BookOpen size={120} />
                        </div>
                      </motion.div>

                      {/* Mission Card 2 - 3D Look */}
                      <motion.div 
                        whileHover={{ y: -8 }}
                        className="p-7 rounded-[2.2rem] bg-[#FFF7ED] border-2 border-white shadow-[0_12px_0_0_#FFEDD5,0_25px_30px_-10px_rgba(232,131,58,0.15)] relative overflow-hidden group"
                      >
                        <div className="relative z-10">
                          <h3 className="font-black text-[#9A3412] text-xl mb-1">Misi Numerasi</h3>
                          <p className="text-sm font-bold text-[#EA580C] opacity-80 mb-6">Selesaikan kuis matematika</p>
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ y: 8, boxShadow: 'none' }}
                            onClick={() => handleAssignMission('Misi Numerasi Dasar', 30, '🧮')}
                            className="w-full py-4 bg-[#E8833A] text-white rounded-[1.2rem] font-black shadow-[0_8px_0_0_#B86228,0_15px_20px_-5px_rgba(232,131,58,0.4)] flex items-center justify-center gap-2 hover:bg-[#D4722D] transition-all"
                          >
                            <CheckCircle2 size={20} /> Tugaskan
                          </motion.button>
                        </div>
                        <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:scale-125 transition-transform text-[#E8833A]">
                          <ShieldAlert size={120} />
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
