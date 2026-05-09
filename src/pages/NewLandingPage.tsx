import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useSmartSchool } from '../context/SmartSchoolContext';
import { Loader2, ArrowLeft, BookOpen, School, Landmark, Users, Sparkles, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const NewLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast, profile } = useSmartSchool();
  
  const [isRegister, setIsRegister] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const [role, setRole] = useState<'siswa' | 'guru' | 'umum' | 'admin'>('siswa');
  const [nisn, setNisn] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (profile) {
      if (profile.role === 'siswa') navigate('/student');
      else if (profile.role === 'kantin') navigate('/kantin');
      else if (profile.role === 'admin' || profile.role === 'guru') navigate('/admin');
    }
  }, [profile, navigate]);

  const handleStartMission = () => {
    setIsWarping(true);
    setTimeout(() => {
      setShowForm(true);
      setIsWarping(false);
    }, 800);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const email = nisn.includes('@') ? nisn : `${nisn}@smartlibrary.id`;

      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            full_name: fullName,
            nisn: nisn,
            role: role,
            coins: 0,
            created_at: new Date().toISOString()
          });
          showToast('Pendaftaran berhasil! Silakan masuk.', 'success');
          setIsRegister(false);
        }
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          const profileSnap = await getDoc(doc(db, 'users', userCredential.user.uid));
          if (profileSnap.exists()) {
            const userRole = profileSnap.data().role;
            setIsExiting(true);
            setTimeout(() => {
              if (userRole === 'siswa') navigate('/student');
              else if (userRole === 'kantin') navigate('/kantin');
              else if (userRole === 'admin' || userRole === 'guru') navigate('/admin');
              else navigate('/library');
            }, 800);
          } else {
            showToast('Profil tidak ditemukan.', 'error');
          }
        }
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      showToast(err.message || 'Terjadi kesalahan. Silakan coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-[#0f1419] text-[#dfe2ea] font-sans min-h-screen flex flex-col items-center justify-center overflow-hidden selection:bg-cyan-500/30 relative`}>
      <style>{`
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(0, 210, 255, 0.4), inset 0 0 10px rgba(0, 210, 255, 0.2); }
            50% { box-shadow: 0 0 40px rgba(0, 210, 255, 0.7), inset 0 0 20px rgba(0, 210, 255, 0.4); }
        }
        .animate-pulse-glow { animation: pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        
        .glass-panel {
            background: rgba(15, 20, 25, 0.4);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(165, 231, 255, 0.2);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
            transform-style: preserve-3d;
            perspective: 1000px;
        }

        .hero-text-glow {
            text-shadow: 0 0 20px rgba(0, 210, 255, 0.5), 0 0 40px rgba(0, 210, 255, 0.3);
        }

        .starfield-bg {
            background: radial-gradient(circle at center, #1a2a3a 0%, #0f1419 100%);
            overflow: hidden;
            position: fixed;
            inset: 0;
            z-index: -1;
        }

        .nebula-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.15;
            z-index: 0;
        }
    
        @keyframes float-hologram {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(5deg); }
        }
        .animate-float-hologram { animation: float-hologram 6s ease-in-out infinite; }
        
        .holographic-3d {
            transform: perspective(1200px) rotateX(15deg) skewX(-2deg);
            text-shadow: 
                0 1px 0 #00d2ff, 
                0 2px 0 #00c6f0, 
                0 3px 0 #00bad2, 
                0 4px 0 #00aec4, 
                0 5px 0 #00a2b6, 
                0 6px 0 #0096a8, 
                0 10px 15px rgba(0, 210, 255, 0.6);
            transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        @keyframes waver-3d {
            0%, 100% { transform: perspective(1200px) rotateX(15deg) rotateY(-2deg) skewX(-2deg); }
            50% { transform: perspective(1200px) rotateX(12deg) rotateY(4deg) skewX(-2deg); }
        }
        .animate-waver-3d {
            animation: waver-3d 8s ease-in-out infinite;
        }

        .warp-speed-active {
            transition: transform 0.6s cubic-bezier(0.7, 0, 0.3, 1), opacity 0.4s ease-in-out;
            transform: scale(3);
            opacity: 0;
            pointer-events: none;
        }
        
        .starfield-warp {
            transition: transform 0.8s cubic-bezier(0.7, 0, 0.3, 1);
            transform: scale(5) rotate(5deg);
        }

        @keyframes shake {
            0% { transform: translate(0, 0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(2px, -2px); }
            60% { transform: translate(-2px, -2px); }
            80% { transform: translate(2px, 2px); }
            100% { transform: translate(0, 0); }
        }
        .animate-shake { animation: shake 0.2s infinite; }

        .input-glow:focus {
            border-bottom-color: #a5e7ff;
            box-shadow: 0 4px 15px -2px rgba(165, 231, 255, 0.2);
            background: rgba(165, 231, 255, 0.03);
        }
        .pulsar-button {
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        .exit-transition {
            animation: space-out 0.8s cubic-bezier(0.7, 0, 0.3, 1) forwards !important;
        }
        @keyframes space-out {
            0% { transform: perspective(1000px) translateZ(0); opacity: 1; filter: blur(0); }
            100% { transform: perspective(1000px) translateZ(-500px) translateY(50px) rotateX(-10deg); opacity: 0; filter: blur(10px); }
        }
      `}</style>

      {/* Background Layers */}
      <div className={`starfield-bg ${isWarping ? 'starfield-warp' : ''}`}>
        <div className="nebula-orb w-[600px] h-[600px] bg-cyan-500 top-[-10%] left-[-10%]"></div>
        <div className="nebula-orb w-[500px] h-[500px] bg-purple-500 bottom-[-5%] right-[-5%]"></div>
        <div className="nebula-orb w-[400px] h-[400px] bg-blue-500 top-[30%] right-[20%]"></div>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#a5e7ff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.div 
            key="welcome"
            exit={{ opacity: 0, scale: 2 }}
            className={`flex flex-col items-center w-full relative z-10 ${isWarping ? 'warp-speed-active' : ''}`}
          >
            {/* Header */}
            <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-slate-950/40 backdrop-blur-lg border-b border-cyan-500/30 transition-opacity duration-1000">
              <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_8px_rgba(0,210,255,0.6)] font-['Space_Grotesk'] tracking-widest uppercase">
                SD NEGERI TEMPUREJO 1
              </div>
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setShowForm(true)}
                  className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold px-6 py-2 rounded-lg hover:bg-cyan-500/30 transition-all"
                >
                  Initialize Login
                </button>
              </div>
            </header>

            {/* Hero Section */}
            <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
              <section className="max-w-6xl w-full flex flex-col items-center gap-12 relative">
                <div className="space-y-2">
                  <p className="font-['Space_Grotesk'] text-[#a5e7ff] tracking-[0.4em] opacity-80 uppercase text-xs">Perpustakaan Digital Terintegrasi</p>
                  <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#a5e7ff] to-transparent mx-auto mt-4"></div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <h1 className="font-['Space_Grotesk'] text-[64px] md:text-[88px] text-white leading-tight tracking-tighter hero-text-glow relative holographic-3d animate-waver-3d">
                    PERPUSTAKAAN <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#a5e7ff] via-cyan-400 to-blue-600 drop-shadow-[0_0_15px_rgba(0,210,255,0.7)]">DIGITAL</span>
                  </h1>

                  {/* 3D Hologram Book Icon */}
                  <div className="absolute -top-12 -left-16 hidden lg:flex items-center justify-center animate-float-hologram">
                    <div className="relative w-28 h-28">
                      <div className="absolute inset-0 border-[1px] border-cyan-500/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
                      <div className="absolute inset-2 border-[1px] border-dashed border-purple-500/40 rounded-full animate-[spin_12s_linear_infinite_reverse]"></div>
                      <div className="absolute inset-4 bg-cyan-500/10 blur-xl rounded-full"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen size={56} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(0,210,255,0.8)]" />
                      </div>
                    </div>
                  </div>
                </div>

                <p className="max-w-2xl text-[#bbc9cf] text-lg leading-relaxed font-['Inter']">
                  Akses pusat literasi digital masa depan SD Negeri Tempurejo 1. Jelajahi ribuan arsip data, modul pembelajaran, dan koleksi literatur dalam satu sistem kendali terpadu.
                </p>

                <div className="mt-8 relative group">
                  <div className="absolute -inset-6 border border-cyan-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 scale-90 group-hover:scale-100"></div>
                  <button 
                    onClick={handleStartMission}
                    className={`relative px-12 py-5 bg-[#1c2026]/40 border border-cyan-500/40 rounded-xl font-['Space_Grotesk'] text-cyan-400 tracking-[0.2em] animate-pulse-glow hover:bg-cyan-500/20 hover:border-cyan-500 transition-all flex items-center gap-4 group ${isWarping ? 'animate-shake' : ''}`}
                  >
                    <span className="relative z-10 uppercase">START MISSION</span>
                    <Rocket className="w-5 h-5 text-cyan-400 group-hover:translate-x-2 transition-transform" />
                  </button>
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 font-['Space_Grotesk'] text-[10px] text-cyan-500/40 uppercase tracking-widest whitespace-nowrap">
                    System Ready // Authorization Required
                  </div>
                </div>
              </section>
            </main>

            <footer className="fixed bottom-0 w-full py-6 flex flex-col md:flex-row justify-between items-center px-12 gap-4 bg-slate-950/60 backdrop-blur-md border-t border-cyan-500/20 transition-opacity duration-1000">
              <div className="text-cyan-400 font-semibold uppercase text-[10px] tracking-widest">
                © 2024 SD NEGERI TEMPUREJO 1 KOTA KEDIRI | PERPUSTAKAAN DIGITAL
              </div>
              <div className="flex gap-8 text-[10px] text-slate-500 uppercase tracking-widest">
                <a className="hover:text-cyan-300 transition-all" href="#">Privacy Protocol</a>
                <a className="hover:text-cyan-300 transition-all" href="#">Sector Terms</a>
              </div>
            </footer>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            initial={{ opacity: 0, z: -100, rotateX: 20 }}
            animate={{ opacity: 1, z: 0, rotateX: 0 }}
            className={`flex items-center justify-center w-full max-w-[1100px] relative z-10 transition-all duration-700 ${isExiting ? 'exit-transition' : ''}`}
          >
            {/* Navigation */}
            <button 
              onClick={() => setShowForm(false)}
              className="fixed top-8 left-8 flex items-center gap-2 text-[#a5e7ff] hover:text-white transition-colors font-bold z-50 bg-[#1c2026]/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
            >
              <ArrowLeft size={18} />
              <span className="text-xs tracking-widest uppercase">KEMBALI</span>
            </button>

            {/* Login/Register Card */}
            <div className="glass-panel w-full rounded-xl overflow-hidden flex flex-col md:flex-row min-h-[700px]">
              {/* Left Hero */}
              <div className="hidden md:flex w-[45%] relative flex-col justify-end p-10 bg-slate-900 overflow-hidden">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYPbQIepsQ8u9NIUErJ4SKj9nIL3Nf-Sc7ES2Mnwopd2pDjAzNhZgQFNbPoorNVu_LZOeOpBKo2b4mEanBUg7HXX4k_AaVacpX5Hm_X__ovtlBJSi8Pt4GIds-oDdqvblk_qAjf3gAiouINAUjeoQLWvgFPFirpGW4OOSE5T9rj_13G3h_KYdR_Rr6pT0tm-utvjENS_QCno_nfTh5ySN57wzUJ-0B2822HGxDdvU9U-4WrhVUiB0OYOJSn-S_bC4kc0ay4Re80nQ"
                  className="absolute inset-0 object-cover opacity-40 mix-blend-luminosity scale-110"
                  alt="Library"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f14] via-[#0a0f14]/40 to-transparent"></div>
                
                <div className="relative z-10 text-left">
                  <div className="flex flex-col items-start mb-6">
                    <BookOpen size={64} className="text-[#a5e7ff] mb-2 drop-shadow-[0_0_15px_rgba(165,231,255,0.5)]" />
                    <div className="h-1 w-16 bg-[#a5e7ff]/30 rounded-full"></div>
                  </div>
                  <div className="mb-2 inline-block px-3 py-1 bg-[#a5e7ff]/20 border border-[#a5e7ff]/30 rounded-full">
                    <span className="text-[10px] font-bold text-[#a5e7ff] tracking-widest uppercase">KOTA KEDIRI</span>
                  </div>
                  <h1 className="font-['Space_Grotesk'] text-white mb-2 leading-tight text-4xl font-bold italic uppercase">PERPUSTAKAAN DIGITAL</h1>
                  <p className="text-[#a5e7ff] font-bold mb-4 text-sm uppercase tracking-widest">SD NEGERI TEMPUREJO 1</p>
                  <p className="text-slate-400 border-l-2 border-[#a5e7ff]/30 pl-4 text-xs leading-relaxed">
                    Pintu gerbang menuju pengetahuan tanpa batas. Jelajahi galaksi literasi dalam genggaman Anda.
                  </p>
                </div>
              </div>

              {/* Right Form */}
              <div className="flex-1 p-10 lg:p-14 flex flex-col justify-center bg-slate-900/40">
                <div className="mb-10 text-left">
                  <h2 className="font-['Space_Grotesk'] text-[#a5e7ff] text-3xl mb-1 tracking-tight font-bold italic uppercase">
                    {isRegister ? 'Daftar Akun Baru' : 'Masuk Terminal'}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    {isRegister ? 'Bergabunglah dengan ekosistem belajar digital kami.' : 'Kembali ke pusat kendali literasi Anda.'}
                  </p>
                </div>

                <form onSubmit={handleAuth} className="flex flex-col gap-6">
                  {isRegister && (
                    <div className="space-y-4">
                      <h3 className="text-slate-500 text-[10px] font-bold tracking-[0.2em] uppercase text-left">IDENTITAS PENGGUNA</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {(['siswa', 'guru', 'umum'] as const).map((r) => (
                          <div 
                            key={r}
                            onClick={() => setRole(r as any)}
                            className={`role-card cursor-pointer flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                              role === r ? 'border-[#a5e7ff] bg-[#a5e7ff]/10 shadow-[0_0_20px_rgba(165,231,255,0.1)]' : 'border-white/10 bg-white/5'
                            }`}
                          >
                            <div className="mb-2 text-[#a5e7ff]">
                              {r === 'siswa' && <School size={24} />}
                              {r === 'guru' && <Landmark size={24} />}
                              {r === 'umum' && <Users size={24} />}
                            </div>
                            <span className="font-bold text-[9px] text-center uppercase tracking-widest">{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    {isRegister && (
                      <div className="relative">
                        <label className="font-bold text-[#a5e7ff] text-[8px] absolute -top-2 left-3 bg-[#1c2026] px-2 z-10 border border-white/10 rounded tracking-widest">NAMA LENGKAP</label>
                        <input 
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-white/5 border-b-2 border-white/10 border-x-0 border-t-0 p-4 text-white placeholder:text-white/20 focus:ring-0 input-glow transition-all rounded-t-lg"
                          placeholder="Nama sesuai identitas resmi"
                          required={isRegister}
                        />
                      </div>
                    )}
                    <div className="relative">
                      <label className="font-bold text-[#a5e7ff] text-[8px] absolute -top-2 left-3 bg-[#1c2026] px-2 z-10 border border-white/10 rounded uppercase tracking-widest">
                        {isRegister ? 'NOMOR INDUK / EMAIL' : 'ID PENGGUNA'}
                      </label>
                      <input 
                        type="text"
                        value={nisn}
                        onChange={(e) => setNisn(e.target.value)}
                        className="w-full bg-white/5 border-b-2 border-white/10 border-x-0 border-t-0 p-4 text-white placeholder:text-white/20 focus:ring-0 input-glow transition-all rounded-t-lg"
                        placeholder={isRegister ? "NISN / NIP / Email" : "Masukkan ID Anda"}
                        required
                      />
                    </div>
                    <div className="relative">
                      <label className="font-bold text-[#a5e7ff] text-[8px] absolute -top-2 left-3 bg-[#1c2026] px-2 z-10 border border-white/10 rounded uppercase tracking-widest">KATA SANDI</label>
                      <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border-b-2 border-white/10 border-x-0 border-t-0 p-4 text-white placeholder:text-white/20 focus:ring-0 input-glow transition-all rounded-t-lg"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="pulsar-button w-full bg-[#00d2ff] text-[#003543] py-4 rounded-xl font-bold uppercase tracking-[0.2em] hover:bg-[#a5e7ff] transition-all flex items-center justify-center gap-2 group text-xs"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <>
                          <span>{isRegister ? 'INISIASI PENDAFTARAN' : 'AKSES TERMINAL'}</span>
                          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-center text-slate-500 text-[12px] uppercase tracking-widest">
                    {isRegister ? 'Sudah memiliki akses?' : 'Belum memiliki akun?'} 
                    <button 
                      type="button"
                      onClick={() => setIsRegister(!isRegister)}
                      className="text-[#a5e7ff] hover:text-white font-bold ml-2 transition-colors underline underline-offset-4"
                    >
                      {isRegister ? 'Masuk' : 'Daftar'}
                    </button>
                  </p>
                </form>

                <div className="mt-12 flex items-center justify-between border-t border-white/5 pt-6 opacity-40">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-wider">Node: Kediri-Server-01</span>
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-widest">v2.4.0</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewLandingPage;
