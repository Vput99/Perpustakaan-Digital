import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, ShieldAlert, Store, Users, Loader2 } from 'lucide-react';
import { authenticateUser } from '../services/authService';

export default function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'Siswa' | 'Admin' | 'Kantin' | 'Umum' | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedRole === 'Siswa' && !selectedClass) {
      setError('Pilih kelas terlebih dahulu');
      return;
    }

    if (!username || !password) {
      setError('Username dan password harus diisi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await authenticateUser(username, password);

      if (!user) {
        setError('Username atau password salah');
        setLoading(false);
        return;
      }

      if (user.role !== selectedRole) {
         setError(`Akun ini tidak memiliki akses sebagai ${selectedRole}`);
         setLoading(false);
         return;
      }

      if (selectedRole === 'Siswa' && selectedClass) {
        // Option to validate class against DB could go here, but for now we trust the user's selection or fallback to DB.
        navigate(`/library?role=Siswa&kelas=${user.kelas || selectedClass}`);
      } else if (selectedRole === 'Admin') {
        navigate('/admin');
      } else if (selectedRole === 'Kantin') {
        navigate('/kantin');
      } else if (selectedRole === 'Umum') {
        navigate('/library?role=Umum');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full border-2 border-slate-100"
      >
        <h1 className="text-3xl font-black text-center mb-8 text-blue-600">SmartLibrary SD</h1>

        {!selectedRole ? (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedRole('Siswa')}
              className="flex flex-col items-center justify-center p-6 bg-blue-50 hover:bg-blue-100 rounded-2xl text-blue-600 transition-colors"
            >
              <User size={32} className="mb-2" />
              <span className="font-bold">Siswa</span>
            </button>
            <button
              onClick={() => setSelectedRole('Admin')}
              className="flex flex-col items-center justify-center p-6 bg-red-50 hover:bg-red-100 rounded-2xl text-red-600 transition-colors"
            >
              <ShieldAlert size={32} className="mb-2" />
              <span className="font-bold">Admin</span>
            </button>
            <button
              onClick={() => setSelectedRole('Kantin')}
              className="flex flex-col items-center justify-center p-6 bg-green-50 hover:bg-green-100 rounded-2xl text-green-600 transition-colors"
            >
              <Store size={32} className="mb-2" />
              <span className="font-bold">Kantin</span>
            </button>
            <button
              onClick={() => setSelectedRole('Umum')}
              className="flex flex-col items-center justify-center p-6 bg-purple-50 hover:bg-purple-100 rounded-2xl text-purple-600 transition-colors"
            >
              <Users size={32} className="mb-2" />
              <span className="font-bold">Umum</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => {
                setSelectedRole(null);
                setError('');
                setUsername('');
                setPassword('');
              }}
              className="self-start text-sm text-slate-500 hover:text-slate-800 mb-4"
            >
              &larr; Kembali
            </button>

            <h2 className="text-xl font-bold text-center mb-4">Login sebagai {selectedRole}</h2>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Masukkan username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Masukkan password"
                />
              </div>
            </div>

            {selectedRole === 'Siswa' && (
              <div className="mt-2 mb-6">
                <p className="text-sm font-medium text-slate-700 mb-2">Pilih Kelas:</p>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map(cls => (
                    <button
                      type="button"
                      key={cls}
                      onClick={() => setSelectedClass(cls)}
                      className={`p-3 rounded-xl font-bold transition-colors ${
                        selectedClass === cls
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Kelas {cls}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={(selectedRole === 'Siswa' && !selectedClass) || loading}
              className="mt-4 w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
