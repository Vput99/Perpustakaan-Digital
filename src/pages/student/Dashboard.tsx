import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'motion/react';
import { Coins, Trophy, LogOut, ChevronRight, BookOpen, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [quests, setQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [profileRes, questsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        supabase.from('quests').select('*').limit(3)
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (questsRes.data) setQuests(questsRes.data);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-nunito">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black">SL</div>
             <h1 className="text-xl font-black text-slate-800">SmartLibrary</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="p-3 bg-white rounded-xl border-2 border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 transition-all"
          >
            <LogOut size={20} />
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Profile Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-12 lg:col-span-4 bg-white rounded-[2rem] p-8 shadow-sm border-2 border-slate-100 flex flex-col items-center text-center"
          >
            <div className="w-32 h-32 rounded-full bg-blue-50 border-4 border-blue-100 overflow-hidden mb-4 p-2">
              <img 
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${profile?.full_name || 'Student'}`} 
                alt="Avatar" 
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-2xl font-black text-slate-800">{profile?.full_name || 'Siswa'}</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Siswa Kelas {profile?.class || '-'}</p>
            
            <div className="mt-8 w-full bg-amber-50 rounded-2xl p-6 border-2 border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-white">
                  <Coins size={24} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-tight">Saldo Koin</p>
                  <p className="text-xl font-black text-amber-700">{profile?.coins || 0}</p>
                </div>
              </div>
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-2xl"
              >
                💰
              </motion.div>
            </div>
          </motion.div>

          {/* Right Content */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Welcome Tile */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-8 text-white relative overflow-hidden"
            >
              <div className="relative z-10">
                <h3 className="text-3xl font-black mb-2">Halo, {profile?.full_name?.split(' ')[0]}! 👋</h3>
                <p className="text-blue-100 font-medium max-w-md">Siap untuk petualangan literasi hari ini? Kumpulkan koin dan tukarkan dengan hadiah menarik di kantin!</p>
                <button 
                  onClick={() => navigate('/')}
                  className="mt-6 px-6 py-3 bg-white text-blue-600 rounded-xl font-black flex items-center gap-2 hover:bg-blue-50 transition-all"
                >
                  Buka Perpustakaan <BookOpen size={18} />
                </button>
              </div>
              <Target size={140} className="absolute -right-10 -bottom-10 text-white/10" />
            </motion.div>

            {/* Misi Literasi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-[2rem] p-8 border-2 border-slate-100 shadow-sm col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <Trophy size={24} className="text-yellow-500" /> Misi Literasi
                  </h3>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">3 Misi Tersedia</span>
                </div>
                
                <div className="space-y-4">
                  {quests.length > 0 ? quests.map((quest) => (
                    <div key={quest.id} className="group p-4 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-blue-200 transition-all flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                          {quest.icon || '📖'}
                        </div>
                        <div>
                          <p className="font-black text-slate-800">{quest.title}</p>
                          <p className="text-sm font-bold text-slate-400">Hadiah: {quest.reward} Koin</p>
                        </div>
                      </div>
                      <button className="p-2 bg-white rounded-lg text-slate-300 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400 font-bold">Belum ada misi baru hari ini.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
