import { Users, ShieldAlert, ListChecks, CheckCircle2, ShoppingBag, BookOpen, Clock, X, ChevronRight, Loader2, Plus, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import KantinAdmin from '../components/KantinAdmin';
import MissionCreator from './admin/MissionCreator';
import { useSmartSchool } from '../context/SmartSchoolContext';
import { supabase } from '../lib/supabase';

export default function AdminView() {
  const { students: contextStudents, profile, loading } = useSmartSchool();
  const [view, setView] = useState<'admin' | 'kantin' | 'create_mission'>('admin');
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const navigate = useNavigate();
  const [readingHistory, setReadingHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showToast, setShowToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const handleAssignMission = async (title: string, reward: number, icon: string) => {
    try {
      const { error } = await supabase
        .from('quests')
        .insert({
          title,
          reward,
          icon,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      setShowToast({ message: `Misi "${title}" berhasil ditugaskan!`, type: 'success' });
      setTimeout(() => setShowToast(null), 3000);
    } catch (err: any) {
      setShowToast({ message: 'Gagal menugaskan misi: ' + err.message, type: 'error' });
      setTimeout(() => setShowToast(null), 3000);
    }
  };

  useEffect(() => {
    if (selectedStudent) {
      const fetchHistory = async () => {
        setLoadingHistory(true);
        const { data } = await supabase
          .from('borrow_history')
          .select('*')
          .eq('student_id', selectedStudent.id)
          .order('created_at', { ascending: false });
        
        setReadingHistory(data || []);
        setLoadingHistory(false);
      };
      fetchHistory();
    }
  }, [selectedStudent]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 relative">
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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-100 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">
                {teacherClass ? `Dashboard Guru Kelas ${teacherClass}` : 'Dashboard Admin'}
              </h1>
              <p className="text-sm font-medium text-slate-500">
                {teacherClass ? `Mengelola siswa Kelas ${teacherClass}` : 'Pantau semua siswa dan berikan misi'}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setView('create_mission')}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-indigo-100"
            >
              <Plus size={20} />
              Buat Misi Baru
            </button>
            <button 
              onClick={() => setView('kantin')}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black transition-all shadow-lg shadow-orange-100"
            >
              <ShoppingBag size={20} />
              Buka Kantin Sehat
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-2xl font-black transition-all border-2 border-slate-100 hover:border-rose-100"
            >
              <LogOut size={20} />
              Keluar
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Students List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-4"
          >
            <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="text-blue-600" /> Data Siswa {teacherClass ? `Kelas ${teacherClass}` : 'Login'}
                </h2>
                {!teacherClass && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedClass(null)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${!selectedClass ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                    >
                      Semua
                    </button>
                    {[1, 2, 3, 4, 5, 6].map(c => (
                      <button
                        key={c}
                        onClick={() => setSelectedClass(c)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${selectedClass === c ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                      >
                        Kls {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {filteredStudents.map(student => (
                  <motion.div 
                    layout
                    key={student.id} 
                    onClick={() => setSelectedStudent(student)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${selectedStudent?.id === student.id ? 'bg-blue-50 border-blue-200 shadow-md' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-sm'}`}
                  >
                    <div className="flex items-center gap-4">
                      <img 
                        src={student.photo_url} 
                        alt="avatar" 
                        className="w-10 h-10 rounded-full bg-white border border-slate-200" 
                      />
                      <div>
                        <h3 className="font-bold text-slate-800">{student.name}</h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Kelas {student.class || student.kelas}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-amber-600">{student.coins} KOIN</span>
                        <span className="text-[10px] font-bold text-slate-400">Online</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-300" />
                    </div>
                  </motion.div>
                ))}
                {filteredStudents.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-slate-400 font-bold">Tidak ada siswa ditemukan.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Quests & History */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {selectedStudent ? (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-100"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <BookOpen className="text-emerald-600" /> Riwayat Baca
                    </h2>
                    <button onClick={() => setSelectedStudent(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                      <X size={18} className="text-slate-400" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Siswa Terpilih</p>
                      <p className="font-black text-slate-800">{selectedStudent.name}</p>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {loadingHistory ? (
                        <div className="py-8 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" /></div>
                      ) : readingHistory.length > 0 ? (
                        readingHistory.map((h, i) => (
                          <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                              <BookOpen size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 text-sm truncate">{h.book_title}</p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                                <Clock size={10} /> {new Date(h.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-8 text-slate-400 text-sm font-medium">Belum ada riwayat membaca.</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="quests"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-100"
                >
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <ListChecks className="text-indigo-600" /> Berikan Misi
                  </h2>

                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                      <h3 className="font-bold text-indigo-900 mb-1">Misi Membaca (Kelas 1-3)</h3>
                      <p className="text-xs text-indigo-700 mb-3">Baca 2 buku cerita nusantara</p>
                      <button 
                        onClick={() => handleAssignMission('Misi Membaca Nusantara', 25, '📚')}
                        className="w-full py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={16} /> Tugaskan
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
                      <h3 className="font-bold text-orange-900 mb-1">Misi Numerasi (Kelas 4-6)</h3>
                      <p className="text-xs text-orange-700 mb-3">Selesaikan kuis matematika dasar</p>
                      <button 
                        onClick={() => handleAssignMission('Misi Numerasi Dasar', 30, '🧮')}
                        className="w-full py-2 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={16} /> Tugaskan
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
