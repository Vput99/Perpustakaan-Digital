import React, { useEffect, useState } from 'react';
import { auth, db } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp 
} from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  Coins, Trophy, LogOut, ChevronRight, BookOpen, Target, 
  History as HistoryIcon, Award, ClipboardList, Star, Clock,
  Home, BookMarked, Calendar, Settings, Sparkles, Eye, ShoppingBag,
  Swords, Backpack, Users, Map as MapIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Float, Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import QuestModal from '../../components/QuestModal';
import Certificate from '../../components/Certificate';
import { AnimatePresence } from 'motion/react';

const CoinModel = () => {
  const { scene } = useGLTF('/moneda__koin.glb');
  const coinRef = useRef<any>();

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
  const [certificates, setCertificates] = useState<any[]>([]);
  const [selectedCert, setSelectedCert] = useState<any>(null);
  const [dailyTests, setDailyTests] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [canteenItems, setCanteenItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [activeQuest, setActiveQuest] = useState<any>(null);
  const navigate = useNavigate();
  const user = auth.currentUser;

  const fetchData = async () => {
    if (!user) return;

    try {
      const [profileRes, questsRes, historyRes, redeemRes, completedRes, testsRes, gradesRes, canteenItemsRes] = await Promise.all([
        getDoc(doc(db, 'users', user.uid)),
        getDocs(collection(db, 'quests')),
        getDocs(query(collection(db, 'borrow_history'), where('student_id', '==', user.uid), orderBy('created_at', 'desc'), limit(3))),
        getDocs(query(collection(db, 'transactions'), where('student_id', '==', user.uid), where('type', '==', 'redeem'), orderBy('created_at', 'desc'), limit(3))),
        getDocs(query(collection(db, 'completed_quests'), where('student_id', '==', user.uid))),
        getDocs(collection(db, 'daily_tests')),
        getDocs(query(collection(db, 'academic_results'), where('student_id', '==', user.uid), orderBy('created_at', 'desc'))),
        getDocs(collection(db, 'canteen_items'))
      ]);

      let studentClass = '';
      if (profileRes.exists()) {
        const profileData = profileRes.data();
        setProfile({ id: profileRes.id, ...profileData });
        studentClass = profileData.class?.toString() || '';
      }
      
      const completedIds = completedRes.docs.map(doc => doc.data().quest_id);
      const allQuests = questsRes.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const filteredQuests = allQuests.filter((q: any) => {
        const isRelevant = !q.target_class || q.target_class === 'Semua' || q.target_class.toString() === studentClass;
        const isNotCompleted = !completedIds.includes(q.id);
        return isRelevant && isNotCompleted;
      }).slice(0, 3);
      
      setQuests(filteredQuests);

      const allTests = testsRes.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const filteredTests = allTests.filter((t: any) => 
        (!t.target_class || t.target_class === 'Semua' || t.target_class.toString() === studentClass) &&
        !completedIds.includes(t.id)
      );
      setDailyTests(filteredTests);

      setGrades(gradesRes.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          subject: data.subject,
          type: 'Ulangan Harian',
          score: data.score,
          date: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : data.created_at
        };
      }));

      setHistory(historyRes.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : data.created_at
        };
      }));
      setRedemptions(redeemRes.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCanteenItems(canteenItemsRes.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      try {
        const certRes = await getDocs(
          query(
            collection(db, 'certificates'),
            where('student_id', '==', user.uid),
            orderBy('created_at', 'desc')
          )
        );
        setCertificates(certRes.docs.map(d => ({
          id: d.id,
          ...d.data(),
          created_at: d.data().created_at instanceof Timestamp
            ? d.data().created_at.toDate().toISOString()
            : d.data().created_at
        })));
      } catch (certErr) {
        console.error('Error fetching certificates:', certErr);
      }
    } catch (error) {
      console.error("Error fetching student dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  if (loading) return (
    <div className="h-screen w-full bg-[#0f1419] flex items-center justify-center">
      <div className="animate-spin text-[#a5e7ff]">
        <Sparkles size={48} />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0f1419] text-[#dfe2ea] font-['Inter']">
      <style>{`
        .glass-panel {
            background: rgba(28, 32, 38, 0.7);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(0, 210, 255, 0.2);
        }
        .glow-border-cyan {
            box-shadow: 0 0 15px rgba(0, 210, 255, 0.3);
            border: 1px solid rgba(0, 210, 255, 0.5);
        }
        .pixel-font {
          font-family: 'Press Start 2P', cursive;
        }
        .scanline-overlay {
            background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.2) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.05), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.05));
            background-size: 100% 4px, 3px 100%;
            pointer-events: none;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            display: inline-block;
        }
      `}</style>

      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 bg-[#0a0f14] border-r border-[#3c494e] flex flex-col z-20">
        <div className="p-6 flex items-center gap-4 border-b border-[#3c494e]">
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#00d2ff]/30">
            <img 
              className="w-full h-full object-cover" 
              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${profile?.full_name}`} 
              alt="Avatar" 
            />
          </div>
          <div>
            <h1 className="pixel-font text-[10px] text-[#a5e7ff] tracking-tighter truncate w-32">{profile?.full_name?.split(' ')[0] || 'ADVENTURER'}</h1>
            <p className="font-['Space_Grotesk'] text-[#bbc9cf] text-[10px] font-bold uppercase tracking-widest mt-1">
              Level {profile?.class} {profile?.role === 'siswa' ? 'Student' : 'Admin'}
            </p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-8 flex flex-col gap-2">
          {[
            { icon: 'home', label: 'Home', id: 0 },
            { icon: 'history', label: 'Inventory', id: 1 },
            { icon: 'shopping_bag', label: 'Merchant', id: 2 },
            { icon: 'settings', label: 'Skills', id: 3 },
          ].map((item) => (
            <div 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                activeTab === item.id 
                ? 'bg-[#00d2ff]/10 border border-[#00d2ff]/30 text-[#a5e7ff]' 
                : 'hover:bg-[#1c2026] text-[#bbc9cf] border border-transparent'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${activeTab === item.id ? 1 : 0}` }}>
                {item.icon}
              </span>
              <p className="font-['Space_Grotesk'] font-bold text-xs uppercase tracking-widest">{item.label}</p>
            </div>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full h-10 bg-[#1c2026] border border-[#3c494e] hover:border-[#ffb4ab] text-[#ffb4ab] text-[10px] pixel-font flex items-center justify-center rounded-lg transition-all"
          >
            LOG OUT
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative bg-[#0B0D17]">
        {/* Atmospheric Background Layers */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_20%,_#3826cd_0%,_transparent_40%)]"></div>
          <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,_#00d2ff_0%,_transparent_35%)]"></div>
          <div className="scanline-overlay absolute inset-0"></div>
        </div>

        <div className="relative z-10 p-8 flex flex-col gap-8 max-w-7xl mx-auto">
          {activeTab === 0 && (
            <>
              {/* Hero Banner Section */}
              <section className="relative h-[400px] rounded-xl overflow-hidden glow-border-cyan group">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                  style={{ 
                    backgroundImage: `linear-gradient(rgba(15, 20, 25, 0.3) 0%, rgba(15, 20, 25, 0.9) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuCOK2QW2ARJ5IZ5lM8rWPD_7VY9yNpAX6_g16myb0kwISaQgOCmeFKZeYL-g44H_FsOuHQOauFxnr86_wESrtVQEYe3uqDr_GSv4ykO_iaAE1CLba8xlaC-4KIpOlc3hWKfKQTR6AAOk6Jj_87DTW_zvcF8EATJ0-yNMT9TlY8WlQadLxLd5lkUlIIye9KvEMPpU7WV1S-SWwRtOO6fivSvPMte0KH1R4dvPEpdbkiWfTDESrE1XF2Y0ID9xaxAeU6EN3IOIWMxW4o')` 
                  }}
                ></div>
                <div className="absolute inset-0 p-12 flex flex-col justify-end gap-6">
                  <div className="flex flex-col gap-3">
                    <span className="pixel-font text-[10px] text-[#a5e7ff] tracking-widest bg-[#a5e7ff]/10 w-fit px-3 py-1 border border-[#a5e7ff]/20">
                      NEW MISSION DISCOVERED
                    </span>
                    <h1 className="pixel-font text-4xl lg:text-5xl text-white leading-tight drop-shadow-[0_4px_10px_rgba(0,210,255,0.5)] uppercase">
                      HALO, {profile?.full_name?.split(' ')[0] || 'ADVENTURER'}!
                    </h1>
                    <p className="text-[#bbc9cf] text-lg max-w-xl font-['Inter'] leading-relaxed">
                      Pintu gerbang petualangan terbuka lebar! Jelajahi koleksi buku terbaru dan selesaikan misi literasi untuk mengumpulkan koin emas.
                    </p>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <button 
                      onClick={() => navigate('/library')}
                      className="bg-[#00d2ff] hover:bg-[#47d6ff] text-[#003543] pixel-font text-[10px] px-8 py-4 rounded-lg flex items-center gap-3 transition-all transform hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,210,255,0.4)]"
                    >
                      START QUEST
                      <span className="material-symbols-outlined !text-sm">double_arrow</span>
                    </button>
                    <button className="bg-[#1c2026]/50 backdrop-blur-md border border-[#3c494e] hover:border-[#a5e7ff] text-white pixel-font text-[10px] px-8 py-4 rounded-lg transition-all">
                      VIEW MAP
                    </button>
                  </div>
                </div>
              </section>

              {/* Stats Dashboard Grid */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Gold Points Card */}
                <div className="glass-panel p-6 rounded-xl flex flex-col gap-3 glow-border-cyan border-t-2 border-t-[#a5e7ff] relative overflow-hidden">
                  <div className="flex justify-between items-center relative z-10">
                    <p className="font-['Space_Grotesk'] font-bold text-[10px] uppercase tracking-widest text-[#bbc9cf]">Gold Points</p>
                    <span className="material-symbols-outlined text-[#a5e7ff]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                  </div>
                  <div className="flex items-end gap-2 relative z-10">
                    <h2 className="pixel-font text-2xl text-white">{profile?.coins || 0}</h2>
                    <span className="pixel-font text-[10px] text-[#a5e7ff] mb-1">GP</span>
                  </div>
                  
                  {/* 3D Coin Miniature Integration */}
                  <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 opacity-50">
                    <Canvas camera={{ position: [0, 0, 5], fov: 35 }} shadows>
                      <ambientLight intensity={2} />
                      <Suspense fallback={null}>
                        <CoinModel />
                      </Suspense>
                    </Canvas>
                  </div>
                </div>

                {/* Mana / Borrow History Card */}
                <div className="glass-panel p-6 rounded-xl flex flex-col gap-3 border-t-2 border-t-[#c4c0ff]">
                  <div className="flex justify-between items-center">
                    <p className="font-['Space_Grotesk'] font-bold text-[10px] uppercase tracking-widest text-[#bbc9cf]">Books Read</p>
                    <span className="material-symbols-outlined text-[#c4c0ff]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_fix_high</span>
                  </div>
                  <h2 className="pixel-font text-2xl text-white">{history.length}<span className="text-[10px] text-[#3826cd]">/∞</span></h2>
                  <div className="w-full bg-[#31353b] h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-[#c4c0ff] w-[65%] shadow-[0_0_8px_rgba(196,192,255,0.5)]"></div>
                  </div>
                </div>

                {/* Level Progress */}
                <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 lg:col-span-2 border-t-2 border-t-[#47d6ff]">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <p className="font-['Space_Grotesk'] font-bold text-[10px] uppercase tracking-widest text-[#bbc9cf]">Level Up Progress</p>
                      <h3 className="pixel-font text-[12px] text-white mt-1">Level {profile?.class} <span className="text-[#a5e7ff] mx-2">→</span> Level {parseInt(profile?.class) + 1}</h3>
                    </div>
                    <div className="text-right">
                      <p className="font-['Space_Grotesk'] font-bold text-[#a5e7ff] text-xl">75%</p>
                      <p className="font-['Space_Grotesk'] font-bold text-[8px] text-[#bbc9cf] uppercase tracking-tighter">800 XP TO GO</p>
                    </div>
                  </div>
                  <div className="relative w-full bg-[#31353b] h-4 rounded-lg border border-[#3c494e] p-[2px]">
                    <div className="h-full bg-gradient-to-r from-[#00d2ff] to-[#47d6ff] rounded-sm transition-all" style={{ width: '75%' }}>
                      <div className="w-full h-full opacity-30 bg-[repeating-linear-gradient(45deg,_transparent,_transparent_10px,_#ffffff_10px,_#ffffff_12px)]"></div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Quests Section */}
              <section className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-[#3c494e] pb-4">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-[#a5e7ff] text-3xl">explore</span>
                    <h2 className="pixel-font text-lg text-white uppercase">ACTIVE QUESTS</h2>
                  </div>
                  <button onClick={() => setActiveTab(1)} className="font-['Space_Grotesk'] font-bold text-[#a5e7ff] hover:underline text-[10px] uppercase tracking-widest">VIEW LOGBOOK</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Map over Quests and Daily Tests */}
                  {[...quests, ...dailyTests].slice(0, 3).map((item, idx) => (
                    <div 
                      key={item.id}
                      onClick={() => {
                        if (item.book_title) {
                          setActiveQuest({ ...item, title: `Ulangan: ${item.book_title} (Bab ${item.chapter})`, icon: '📝', reward: 50, isTest: true });
                        } else {
                          setActiveQuest(item);
                        }
                      }}
                      className="glass-panel group hover:bg-[#262a30] transition-all cursor-pointer rounded-xl overflow-hidden border border-[#3c494e] flex flex-col h-full"
                    >
                      <div className="h-32 w-full overflow-hidden relative">
                        <img 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          src={item.image || (item.book_title ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk6yMbp8Lbi9JZ7Htg7WzbfG8jBVfJIBfEZNA28UHfj46pPzMiyS-czcoVrKvSsY-WvWxKbxCrKRNt5gZh-_UUTL64zHQkcH63RxpwQWMrGmtJ2C5cWYFblJIyQ7csIMmEQJUfO82Z3zc4rXg7eSegAEF_p1ZZaei4TanDLRYENn1RgWIip4QPPa8zSOINsZ41QcdgZ3kWhV2IsKVd_l6bZ7aMdbJde_a2D9MepEy5cG-f0tJTf7dUuvVw6Ow0EhSyyjNKz3hIoOc' : 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOS92LO-swvXinXpKIbP9ap1JWGZRfAUl62Hb2DIRnCAMahiymI7SlAwa5RH3cDAu5L7umxRfagzskbEoKd9ZbVUrlVZi9pICBZb3MndB0BmowlH3pgNLMUwTHDQrdljIaDHbkiF7uDwBedBPVrpul26W1Vuo88ZtGyYB58Hesh_24rQfoDef60jXWZsjrkG5Rp-AQKIM2vwL7w2KpU67dqjyLQid_bAF4g-C6nkN8Ayap_7n-V2sIhEWYwPDz7GEcmXyGx1sehDQ')} 
                          alt="Quest" 
                        />
                        <div className={`absolute top-2 right-2 font-['Space_Grotesk'] text-[8px] font-bold px-2 py-1 rounded ${item.book_title ? 'bg-[#ffb4ab] text-[#690005]' : 'bg-[#a5e7ff] text-[#003543]'}`}>
                          {item.book_title ? 'EXAM' : 'MISSION'}
                        </div>
                      </div>
                      <div className="p-5 flex flex-col gap-2 flex-1">
                        <h4 className="pixel-font text-[10px] text-white leading-relaxed truncate">
                          {item.book_title ? `Ulangan: ${item.book_title}` : item.title}
                        </h4>
                        <p className="text-[#bbc9cf] text-[11px] line-clamp-2">
                          {item.book_title ? `Uji kemampuanmu pada Bab ${item.chapter} dari buku ${item.book_title}.` : item.description}
                        </p>
                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-[#3c494e]">
                          <span className="text-[#a5e7ff] font-['Space_Grotesk'] font-bold text-[10px] tracking-widest">
                            +{item.reward || 50} GP REWARD
                          </span>
                          <span className="material-symbols-outlined text-[#bbc9cf] group-hover:text-[#a5e7ff] transition-all">arrow_forward</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {quests.length === 0 && dailyTests.length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-[#3c494e] rounded-xl text-[#bbc9cf] font-['Space_Grotesk'] uppercase tracking-widest text-xs">
                      No Active Quests Available
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {activeTab === 1 && (
            <section className="flex flex-col gap-8">
              <div className="flex items-center gap-4 border-b border-[#3c494e] pb-4">
                <span className="material-symbols-outlined text-[#a5e7ff] text-3xl">backpack</span>
                <h2 className="pixel-font text-lg text-white uppercase">INVENTORY & LOGBOOK</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Certificates */}
                <div className="glass-panel p-8 rounded-xl flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-['Space_Grotesk'] font-bold text-xs uppercase tracking-[0.2em] text-[#a5e7ff]">Quest Certificates</h3>
                    <span className="bg-[#a5e7ff]/10 text-[#a5e7ff] px-3 py-1 text-[10px] pixel-font">{certificates.length}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {certificates.map((cert) => (
                      <div 
                        key={cert.id}
                        onClick={() => setSelectedCert(cert)}
                        className="bg-[#1c2026]/50 border border-[#3c494e] hover:border-[#a5e7ff] p-4 rounded-lg flex items-center justify-between cursor-pointer group transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <span className="material-symbols-outlined text-[#a5e7ff] text-2xl">workspace_premium</span>
                          <div>
                            <p className="font-bold text-sm text-white">{cert.quest_title}</p>
                            <p className="text-[10px] text-[#bbc9cf]">{new Date(cert.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-[#3c494e] group-hover:text-[#a5e7ff]">visibility</span>
                      </div>
                    ))}
                    {certificates.length === 0 && (
                      <p className="text-center py-12 text-[#3c494e] italic text-sm">Belum ada sertifikat petualang.</p>
                    )}
                  </div>
                </div>

                {/* Borrow History */}
                <div className="glass-panel p-8 rounded-xl flex flex-col gap-6">
                  <h3 className="font-['Space_Grotesk'] font-bold text-xs uppercase tracking-[0.2em] text-[#a5e7ff]">Reading Log</h3>
                  <div className="flex flex-col gap-4">
                    {history.map((item, idx) => (
                      <div key={idx} className="bg-[#1c2026]/50 border border-[#3c494e] p-4 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-bold text-sm text-white">{item.book_title}</p>
                          <p className="text-[10px] text-[#bbc9cf] uppercase tracking-widest mt-1">Returned: {new Date(item.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-[#0bda54] uppercase tracking-widest">+XP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 2 && (
            <section className="flex flex-col gap-8">
              <div className="flex items-center justify-between border-b border-[#3c494e] pb-4">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-[#a5e7ff] text-3xl">storefront</span>
                  <h2 className="pixel-font text-lg text-white uppercase">MERCHANT GUILD</h2>
                </div>
                <div className="bg-[#a5e7ff]/10 px-4 py-2 rounded border border-[#a5e7ff]/30 flex items-center gap-2">
                  <span className="pixel-font text-[10px] text-[#a5e7ff]">{profile?.coins || 0} GP</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {canteenItems.map((item) => (
                  <div 
                    key={item.id}
                    className={`glass-panel p-4 rounded-xl flex flex-col gap-4 group transition-all ${item.stock === 0 ? 'opacity-50 grayscale' : 'hover:bg-[#1c2026] shadow-xl'}`}
                  >
                    <div className="h-40 bg-[#0a0f14] rounded-lg overflow-hidden flex items-center justify-center p-4 relative">
                      <img src={item.image || 'https://cdn-icons-png.flaticon.com/512/3067/3067451.png'} alt={item.name} className="h-full object-contain group-hover:scale-110 transition-transform" />
                      <div className="absolute top-2 right-2 bg-[#a5e7ff] text-[#003543] font-['Space_Grotesk'] font-bold text-[10px] px-2 py-1 rounded">
                        {item.price} GP
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="font-bold text-sm text-white truncate">{item.name}</h4>
                      <p className="text-[10px] text-[#bbc9cf] uppercase tracking-widest">Stock: {item.stock}</p>
                    </div>
                    <button 
                      disabled={item.stock === 0 || (profile?.coins || 0) < item.price}
                      onClick={() => setActiveQuest({ ...item, isShop: true })}
                      className={`w-full py-2 rounded font-bold text-[10px] uppercase tracking-widest transition-all ${
                        item.stock > 0 && (profile?.coins || 0) >= item.price
                        ? 'bg-[#00d2ff] text-[#003543] hover:bg-[#a5e7ff]'
                        : 'bg-[#31353b] text-[#bbc9cf] cursor-not-allowed'
                      }`}
                    >
                      Exchange
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 3 && (
            <section className="flex flex-col gap-8">
              <div className="flex items-center gap-4 border-b border-[#3c494e] pb-4">
                <span className="material-symbols-outlined text-[#a5e7ff] text-3xl">auto_fix_normal</span>
                <h2 className="pixel-font text-lg text-white uppercase">CHARACTER SKILLS & STATS</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Character Sheet */}
                <div className="glass-panel p-8 rounded-xl flex flex-col gap-8 lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h3 className="font-['Space_Grotesk'] font-bold text-xs uppercase tracking-[0.2em] text-[#bbc9cf]">Basic Attributes</h3>
                      <div className="space-y-4">
                        {[
                          { label: 'Full Name', value: profile?.full_name },
                          { label: 'Student ID', value: profile?.id?.slice(0, 10) },
                          { label: 'Class Rank', value: `Grade ${profile?.class}` },
                          { label: 'Guild Role', value: profile?.role?.toUpperCase() },
                        ].map((attr, idx) => (
                          <div key={idx} className="flex flex-col gap-1">
                            <p className="text-[8px] font-bold text-[#3c494e] uppercase tracking-widest">{attr.label}</p>
                            <p className="font-bold text-sm text-[#a5e7ff]">{attr.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h3 className="font-['Space_Grotesk'] font-bold text-xs uppercase tracking-[0.2em] text-[#bbc9cf]">Academic Performance</h3>
                      <div className="flex flex-col gap-4">
                        {grades.map((grade, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-[#1c2026]/50 p-3 rounded">
                            <div>
                              <p className="font-bold text-xs text-white">{grade.subject}</p>
                              <p className="text-[8px] text-[#bbc9cf] uppercase tracking-widest">{new Date(grade.date).toLocaleDateString()}</p>
                            </div>
                            <span className={`pixel-font text-[10px] ${grade.score >= 75 ? 'text-[#0bda54]' : 'text-[#ffb4ab]'}`}>
                              {grade.score}
                            </span>
                          </div>
                        ))}
                        {grades.length === 0 && <p className="text-center py-8 text-[#3c494e] italic text-xs">No academic records yet.</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Level Up Info Card */}
                <div className="glass-panel p-8 rounded-xl flex flex-col gap-6 border-l-4 border-l-[#a5e7ff]">
                   <h3 className="font-['Space_Grotesk'] font-bold text-xs uppercase tracking-[0.2em] text-[#a5e7ff]">Path to Mastery</h3>
                   <div className="space-y-6">
                      <div className="text-center p-6 bg-[#0a0f14] rounded-lg border border-[#3c494e]">
                        <p className="text-[8px] font-bold text-[#bbc9cf] uppercase tracking-[0.2em] mb-2">Total Gold Points Earned</p>
                        <h2 className="pixel-font text-3xl text-white">{profile?.coins || 0}</h2>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-[#bbc9cf]">
                          <span>Current XP</span>
                          <span>Next Level</span>
                        </div>
                        <div className="w-full bg-[#31353b] h-3 rounded-full overflow-hidden p-[1px]">
                          <div className="h-full bg-[#a5e7ff] rounded-full shadow-[0_0_10px_rgba(165,231,255,0.5)]" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                      <p className="text-[10px] text-[#bbc9cf] italic leading-relaxed text-center">
                        "Setiap buku yang dibaca adalah satu langkah menuju kebijaksanaan yang lebih besar."
                      </p>
                   </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      <AnimatePresence>
        {activeQuest && (
          <QuestModal 
            quest={activeQuest} 
            onClose={() => {
              setActiveQuest(null);
              fetchData();
            }} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCert && (
          <Certificate
            studentName={selectedCert.student_name}
            questTitle={selectedCert.quest_title}
            date={selectedCert.date}
            onClose={() => setSelectedCert(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;
