import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, User, Lock, Loader2, UserPlus, BookOpen, GraduationCap } from 'lucide-react';

const Login: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<'siswa' | 'guru' | 'umum'>('siswa');
  const [nisn, setNisn] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const email = `${nisn}@sekolah.id`;

      if (isRegister) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (signUpData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: signUpData.user.id,
              full_name: fullName,
              nisn: nisn,
              class: (role === 'siswa' || role === 'guru') ? grade : null,
              role: role,
              coins: 0
            });

          if (profileError) throw profileError;
          
          alert('Pendaftaran berhasil! Silakan masuk.');
          setIsRegister(false);
        }
      } else {
        const { data: loginData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;

        if (loginData.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', loginData.user.id)
            .single();

          if (profileError) throw profileError;

          const userRole = profile.role;
          if (userRole === 'siswa') navigate('/student');
          else if (userRole === 'kantin') navigate('/kantin');
          else if (userRole === 'admin' || userRole === 'guru') navigate('/admin');
          else navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-nunito overflow-hidden relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/background.jpg")' }}
    >
      <div className="absolute inset-0 bg-slate-900/40 z-0" />

      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-[10%] left-[10%] text-6xl opacity-20"
        >
          🚀
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute bottom-[15%] right-[15%] text-7xl opacity-20"
        >
          📚
        </motion.div>
      </div>

      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-black/20 border border-white/20 p-8 md:p-10 relative z-10"
      >
        <div className="text-center mb-6">
          <motion.img 
            layout
            src="/logo.png" 
            alt="Logo" 
            className="w-20 h-20 mx-auto mb-4 object-contain" 
          />
          <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
            Smart Library <br />
            <span className="text-blue-600 text-lg">SD NEGERI TEMPUREJO 1</span>
          </h1>
        </div>

        {isRegister && (
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
            {(['siswa', 'guru', 'umum'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                  role === r ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2"
          >
            <span>⚠️ {error}</span>
          </motion.div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
              {role === 'siswa' ? 'NISN' : role === 'guru' ? 'NIP' : 'Username'}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <User size={18} />
              </div>
              <input 
                type="text" 
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white/50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-400 focus:bg-white transition-all font-bold text-slate-700"
                placeholder={`Masukkan ${role === 'siswa' ? 'NISN' : role === 'guru' ? 'NIP' : 'Username'}`}
                required
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isRegister && (
              <motion.div
                key="register-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nama Lengkap</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <BookOpen size={18} />
                    </div>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-white/50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-400 focus:bg-white transition-all font-bold text-slate-700"
                      placeholder="Nama Lengkap"
                      required
                    />
                  </div>
                </div>

                {(role === 'siswa' || role === 'guru') && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-2"
                  >
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Kelas</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <GraduationCap size={18} />
                      </div>
                      <select 
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-white/50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-400 focus:bg-white transition-all font-bold text-slate-700 appearance-none"
                        required
                      >
                        <option value="">Pilih Kelas</option>
                        {[1,2,3,4,5,6].map(num => (
                          <option key={num} value={num}>Kelas {num}</option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white/50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-400 focus:bg-white transition-all font-bold text-slate-700"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group mt-2"
          >
            {loading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                {isRegister ? 'Daftar Sekarang' : 'Masuk Petualangan'} 
                {isRegister ? <UserPlus size={20} /> : <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t-2 border-slate-100 text-center">
          <p className="text-slate-400 text-sm font-bold">
            {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'} 
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="text-blue-500 ml-1 hover:underline focus:outline-none"
            >
              {isRegister ? 'Masuk di sini' : 'Daftar di sini'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

