import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { 
  LogIn, 
  User, 
  Lock, 
  Loader2, 
  AlertCircle,
  Library
} from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { profile } = await loginUser(identifier, password);

      if (profile) {
        const role = profile.role;
        if (role === 'admin' || role === 'guru') {
          navigate('/admin');
        } else if (role === 'siswa') {
          navigate('/dashboard');
        } else {
          navigate('/'); // Fallback
        }
      } else {
        // Handle case where auth succeeds but profile doesn't exist
        setError('Profil pengguna tidak ditemukan. Silakan hubungi admin.');
      }
    } catch (err: any) {
      console.error(err);
      // Friendly error messages
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('NISN/NIP/Email atau password salah.');
      } else {
        setError('Terjadi kesalahan saat login. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-4 text-white">
            <Library size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">SmartLibrary</h1>
          <p className="text-slate-500 mt-2 font-medium">SD Negeri Tempurejo 1</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Selamat Datang Kembali</h2>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start gap-3"
            >
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 ml-1">
                NISN / NIP / Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <User size={20} />
                </div>
                <input 
                  type="text" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-700"
                  placeholder="Contoh: 12345678"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-semibold text-slate-600">Password</label>
                <a href="#" className="text-xs font-bold text-blue-600 hover:underline">Lupa Password?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-700"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <>
                  <Loader2 size={22} className="animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Masuk Ke Perpustakaan</span>
                  <LogIn size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <p className="text-center text-slate-400 text-sm mt-8 font-medium">
          Belum punya akun? <span className="text-blue-600 font-bold cursor-pointer hover:underline">Hubungi Petugas Perpus</span>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
