import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'motion/react';
import { 
  Coins, Trophy, LogOut, ChevronRight, BookOpen, Target, 
  History, Award, ClipboardList, Star, Clock,
  Home, BookMarked, Calendar, Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Float, Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useRef } from 'react';

const CoinModel = () => {
  const { scene } = useGLTF('/moneda__koin.glb');
  const coinRef = useRef<any>();

  // Rotasi otomatis tambahan
  useFrame((state) => {
    if (coinRef.current) {
      coinRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Float speed={3} rotationIntensity={2} floatIntensity={2}>
      <primitive 
        ref={coinRef}
        object={scene} 
        scale={2.8} 
        position={[0, 0, 0]} 
        rotation={[0, 0, 0]}
      />
    </Float>
  );
};

useGLTF.preload('/moneda__koin.glb');

const StudentDashboard: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [quests, setQuests] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([
    { subject: 'Bahasa Indonesia', type: 'Ulangan Harian', score: 95, date: '2024-03-20' },
    { subject: 'Matematika', type: 'Tugas', score: 88, date: '2024-03-18' },
    { subject: 'IPA', type: 'Ulangan Harian', score: 92, date: '2024-03-15' }
  ]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [profileRes, questsRes, historyRes, redeemRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        supabase.from('quests').select('*').limit(3),
        supabase.from('borrow_history').select('*').eq('student_id', session.user.id).order('created_at', { ascending: false }).limit(3),
        supabase.from('transactions').select('*').eq('student_id', session.user.id).eq('type', 'redeem').order('created_at', { ascending: false }).limit(3)
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (questsRes.data) setQuests(questsRes.data);
      if (historyRes.data) setHistory(historyRes.data);
      if (redeemRes.data) setRedemptions(redeemRes.data);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return null;

  // Badge thresholds (Logic for lighting up)
  const badges = [
    { title: 'Pembaca Pemula', icon: '🐣', requirement: 1, current: history.length, color: 'bg-green-100 text-green-600' },
    { title: 'Kolektor Koin', icon: '💰', requirement: 50, current: profile?.coins || 0, color: 'bg-amber-100 text-amber-600' },
    { title: 'Penyelidik Buku', icon: '🔍', requirement: 5, current: history.length, color: 'bg-blue-100 text-blue-600' },
    { title: 'Bintang Literasi', icon: '⭐', requirement: 3, current: quests.length, color: 'bg-purple-100 text-purple-600' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <div 
      className="min-h-screen font-nunito relative overflow-hidden flex bg-fixed bg-cover bg-center"
      style={{ backgroundImage: "url('/background dashboard siswa.png')" }}
    >
      {/* Dark Overlay for depth */}
      <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />

      {/* 1. Slim Navigation Sidebar */}
      <motion.aside 
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="w-20 hidden md:flex flex-col items-center py-8 gap-8 relative z-50 bg-white/5 backdrop-blur-3xl border-r border-white/10"
      >
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white shadow-xl border border-white/20">
          <BookOpen size={24} />
        </div>
        <nav className="flex flex-col gap-6 mt-12">
          {[Home, History, Calendar, Settings].map((Icon, i) => (
            <motion.div 
              key={i}
              onClick={() => setActiveTab(i)}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
              className={`p-3 rounded-2xl cursor-pointer transition-all ${activeTab === i ? 'bg-white/20 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
            >
              <Icon size={24} />
            </motion.div>
          ))}
        </nav>
      </motion.aside>

      <main className="flex-1 flex flex-col relative z-10 overflow-y-auto max-h-screen">
        {/* 2. Top Header Bar */}
        <motion.header 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-6 md:p-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl px-12 py-5 rounded-[3rem] border border-white/10 shadow-2xl">
            <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-lg">SmartLibrary</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-2xl px-6 py-3 rounded-[2.5rem] border border-white/20 shadow-xl">
              <div className="w-10 h-10 rounded-full border-2 border-white/50 overflow-hidden bg-indigo-100">
                <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${profile?.full_name}`} alt="avatar" />
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-white leading-none">{profile?.full_name || 'Vicky'}</p>
                <p className="text-[10px] font-bold text-white/90 uppercase tracking-widest mt-1">Siswa Kelas {profile?.class}</p>
              </div>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="px-6 py-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-white font-black text-xs hover:bg-white/20 transition-all uppercase tracking-widest"
            >
              Keluar <LogOut size={16} className="inline ml-2" />
            </motion.button>
          </div>
        </motion.header>

        <div className="p-6 md:p-8 grid grid-cols-12 gap-8 max-w-[1600px] mx-auto w-full">
          {/* 3. Profile Sidebar Card */}
          <div className="col-span-12 lg:col-span-3 space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-3xl rounded-[4rem] p-10 border border-white/20 shadow-2xl text-center relative overflow-hidden group"
            >
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-48 h-48 rounded-full border-[10px] border-white/20 bg-white/10 p-2 shadow-2xl mb-8">
                  <img 
                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${profile?.full_name}`} 
                    className="w-full h-full rounded-full object-cover" 
                    alt="profile"
                  />
                </div>
                <h2 className="text-3xl font-black text-white mb-2">{profile?.full_name || 'vicky'}</h2>
                <div className="px-6 py-2 bg-blue-600/80 rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-lg">
                  Siswa Kelas {profile?.class}
                </div>
              </div>
            </motion.div>

            {/* Saldo Koin Card - Match the Image */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-3xl rounded-[3.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] mb-2">Saldo Koin:</p>
                  <p className="text-6xl font-black text-white tabular-nums">{profile?.coins || 0}</p>
                </div>
                <div className="relative">
                  <div className="w-32 h-32 -mr-4 -mt-4 cursor-grab active:cursor-grabbing">
                    <Canvas camera={{ position: [0, 0, 5], fov: 35 }} shadows>
                      <ambientLight intensity={2} />
                      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={3} />
                      <pointLight position={[-10, -10, -10]} intensity={2} />
                      <Suspense fallback={null}>
                        <CoinModel />
                        <Environment preset="apartment" />
                        <ContactShadows position={[0, -1.2, 0]} opacity={0.6} scale={5} blur={2} far={4} />
                      </Suspense>
                      <OrbitControls enableZoom={false} autoRotate={false} />
                    </Canvas>
                  </div>
                </div>
              </div>
              <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-3">Poin ke level berikutnya</p>
              <div className="h-4 bg-white/5 rounded-full p-1 border border-white/10 overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  className="h-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                />
              </div>
            </motion.div>
          </div>

          {/* 4. Dynamic Content Area */}
          <div className="col-span-12 lg:col-span-9 space-y-8">
            {activeTab === 0 && (
              <>
                {/* Dark Galaxy Hero Banner */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-950/80 backdrop-blur-3xl rounded-[4rem] p-16 relative overflow-hidden border border-white/5 shadow-2xl shadow-indigo-950/50"
                >
                  <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none" />
                  <div className="absolute -top-1/2 -right-1/4 w-[80%] h-[150%] bg-indigo-600/20 blur-[120px] rounded-full" />
                  <div className="absolute -bottom-1/2 -left-1/4 w-[80%] h-[150%] bg-blue-600/10 blur-[120px] rounded-full" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                      <h3 className="text-7xl font-black text-white tracking-tighter leading-none">Halo, {profile?.full_name?.split(' ')[0]}!</h3>
                      <span className="text-6xl animate-bounce-slow">👋</span>
                    </div>
                    <p className="text-white text-2xl font-medium max-w-2xl leading-relaxed mb-12">
                      Pintu gerbang ilmu terbuka lebar! Jelajahi ribuan kisah dan kumpulkan koin di setiap petualangan.
                    </p>
                    <motion.button 
                      whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255,255,255,0.3)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/')}
                      className="px-10 py-5 bg-white/10 backdrop-blur-md rounded-[2rem] border-2 border-white/20 text-white font-black text-xl flex items-center gap-4 group transition-all"
                    >
                      Buka Perpustakaan <BookMarked size={28} className="group-hover:rotate-12 transition-transform" />
                    </motion.button>
                  </div>
                </motion.div>

                {/* Tugas & Misi Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-2xl rounded-[3.5rem] p-10 border border-white/10 shadow-xl"
                  >
                    <div className="flex items-center gap-4 mb-10">
                      <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-300">
                        <ClipboardList size={28} />
                      </div>
                      <h3 className="text-2xl font-black text-white">Tugas Baru</h3>
                    </div>
                    <div className="space-y-6">
                      {[{ title: 'Kuis Literasi Pekanan', deadline: 'Tenggat Waktu', icon: '⚡' }].map((task, i) => (
                        <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-5">
                            <div className="text-3xl">{task.icon}</div>
                            <div>
                              <p className="font-black text-white text-sm">{task.title}</p>
                              <p className="text-[10px] font-bold text-white/70 uppercase mt-2 tracking-widest">Tenggat Waktu</p>
                            </div>
                          </div>
                          <p className="text-xs font-black text-blue-400">{task.deadline}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-2xl rounded-[3.5rem] p-10 border border-white/10 shadow-xl"
                  >
                    <div className="flex items-center gap-4 mb-10">
                      <div className="p-3 bg-yellow-500/20 rounded-2xl text-yellow-300">
                        <Trophy size={28} />
                      </div>
                      <h3 className="text-2xl font-black text-white">Misi Literasi</h3>
                    </div>
                    <div className="space-y-6">
                      {quests.map((quest) => (
                        <div key={quest.id} className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between group">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-3xl">{quest.icon || '📖'}</div>
                            <div>
                              <p className="font-black text-white text-sm">{quest.title}</p>
                              <p className="text-[10px] font-black text-yellow-400 uppercase mt-2 tracking-[0.2em]">+{quest.reward} KOIN</p>
                            </div>
                          </div>
                          <ChevronRight size={24} className="text-white/40" />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </>
            )}

            {activeTab === 1 && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div className="bg-white/5 backdrop-blur-2xl rounded-[3.5rem] p-10 border border-white/10">
                    <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4">
                      <History className="text-blue-400" /> Riwayat Baca
                    </h3>
                    <div className="space-y-4">
                      {history.map((h, i) => (
                        <div key={i} className="p-4 bg-white/5 rounded-2xl flex justify-between items-center">
                          <span className="text-white font-bold">{h.book_title || 'Judul Buku'}</span>
                          <span className="text-white/70 text-xs">{new Date(h.created_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div className="bg-white/5 backdrop-blur-2xl rounded-[3.5rem] p-10 border border-white/10">
                    <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4">
                      <Award className="text-purple-400" /> Koleksi Badge
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {badges.map((badge, i) => (
                        <div key={i} className={`p-4 rounded-2xl text-center ${badge.current >= badge.requirement ? badge.color : 'bg-white/5 opacity-30 grayscale'}`}>
                          <div className="text-3xl mb-2">{badge.icon}</div>
                          <p className="text-[10px] font-black uppercase">{badge.title}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                <motion.div className="bg-white/5 backdrop-blur-2xl rounded-[3.5rem] p-10 border border-white/10">
                  <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4">
                    <Coins className="text-yellow-400" /> Riwayat Penukaran Koin
                  </h3>
                  <div className="space-y-4">
                    {redemptions.map((r, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-2xl flex justify-between items-center border border-white/5">
                        <span className="text-white font-bold">{r.item_name || 'Penukaran'}</span>
                        <span className="text-yellow-400 font-black">-{r.amount} KOIN</span>
                      </div>
                    ))}
                    {redemptions.length === 0 && <p className="text-white/40 text-center py-8">Belum ada transaksi</p>}
                  </div>
                </motion.div>

                {/* Nilai Akademik Section */}
                <motion.div className="bg-white/5 backdrop-blur-2xl rounded-[3.5rem] p-10 border border-white/10 shadow-2xl">
                  <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4">
                    <ClipboardList className="text-green-400" /> Nilai Tugas & Ulangan
                  </h3>
                  <div className="overflow-hidden rounded-3xl border border-white/5">
                    <table className="w-full text-left">
                      <thead className="bg-white/10 text-white/70 text-[10px] font-black uppercase tracking-widest">
                        <tr>
                          <th className="px-6 py-4">Mata Pelajaran</th>
                          <th className="px-6 py-4">Jenis</th>
                          <th className="px-6 py-4">Nilai</th>
                          <th className="px-6 py-4">Tanggal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {grades.map((g, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 text-white font-bold text-sm">{g.subject}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${g.type === 'Ulangan Harian' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                {g.type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-xl font-black ${g.score >= 90 ? 'text-green-400' : 'text-white'}`}>{g.score}</span>
                            </td>
                            <td className="px-6 py-4 text-white/70 text-xs">{new Date(g.date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === 2 && (
              <motion.div className="bg-white/5 backdrop-blur-2xl rounded-[4rem] p-16 border border-white/10 text-center">
                <Calendar size={80} className="mx-auto text-white/20 mb-8" />
                <h2 className="text-4xl font-black text-white mb-4">Jadwal Tugas</h2>
                <p className="text-white text-xl max-w-xl mx-auto">
                  Fitur jadwal tugas sedang disinkronkan dengan kalender akademik sekolah.
                </p>
              </motion.div>
            )}

            {activeTab === 3 && (
              <motion.div className="bg-white/5 backdrop-blur-2xl rounded-[4rem] p-16 border border-white/10">
                <h2 className="text-4xl font-black text-white mb-12 flex items-center gap-6">
                  <Settings size={40} className="text-indigo-400" /> Pengaturan Akun
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                  <div className="space-y-2">
                    <label className="text-white/70 text-[10px] font-black uppercase ml-4">Nama Lengkap</label>
                    <input disabled value={profile?.full_name} className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-4 text-white font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-white/70 text-[10px] font-black uppercase ml-4">Kelas</label>
                    <input disabled value={profile?.class} className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-4 text-white font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-white/70 text-[10px] font-black uppercase ml-4">NISN / ID</label>
                    <input disabled value={profile?.id?.slice(0, 8)} className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-4 text-white font-bold" />
                  </div>
                </div>
                <div className="mt-12 p-8 bg-blue-500/10 border border-blue-500/20 rounded-3xl text-blue-200">
                  <p className="font-bold mb-2">💡 Info Profil</p>
                  <p className="text-sm opacity-80">Untuk mengubah data nama atau kelas, silakan hubungi petugas perpustakaan atau admin sekolah.</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Aesthetic Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [-10, 10, -10],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: Math.random() * 5 + 3,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
          className="absolute w-1 h-1 bg-white rounded-full blur-[1px] pointer-events-none"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
};

export default StudentDashboard;

