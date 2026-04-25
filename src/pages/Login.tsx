import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, ShieldAlert, Store, Users } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'Siswa' | 'Admin' | 'Kantin' | 'Umum' | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  const handleLogin = () => {
    if (selectedRole === 'Siswa' && selectedClass) {
      navigate(`/library?role=Siswa&kelas=${selectedClass}`);
    } else if (selectedRole === 'Admin') {
      navigate('/admin');
    } else if (selectedRole === 'Kantin') {
      navigate('/kantin');
    } else if (selectedRole === 'Umum') {
      navigate('/library?role=Umum');
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
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setSelectedRole(null)}
              className="self-start text-sm text-slate-500 hover:text-slate-800 mb-4"
            >
              &larr; Kembali
            </button>

            <h2 className="text-xl font-bold text-center mb-4">Login sebagai {selectedRole}</h2>

            {selectedRole === 'Siswa' && (
              <div className="mb-6">
                <p className="text-sm font-medium text-slate-700 mb-2">Pilih Kelas:</p>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map(cls => (
                    <button
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
              onClick={handleLogin}
              disabled={selectedRole === 'Siswa' && !selectedClass}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-200"
            >
              Masuk
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
