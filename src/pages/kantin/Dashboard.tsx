import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Coins, LogOut, Loader2, CheckCircle2, User, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const KantinDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState<{msg: string, amount: number} | null>(null);
  const navigate = useNavigate();

  const searchStudents = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'siswa')
      .ilike('full_name', `%${searchQuery}%`);
    
    if (data) setStudents(data);
    setLoading(false);
  };

  const handleTransaction = async (studentId: string, amount: number) => {
    if (selectedStudent.coins < amount) {
      alert('Saldo koin tidak cukup!');
      return;
    }

    setProcessing(true);
    try {
      // 1. Decrement coins
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ coins: selectedStudent.coins - amount })
        .eq('id', studentId);

      if (updateError) throw updateError;

      // 2. Record transaction
      const { error: transError } = await supabase
        .from('transactions')
        .insert({
          student_id: studentId,
          amount: amount,
          type: 'redeem',
          description: `Penukaran di Kantin (${amount} Koin)`
        });

      if (transError) throw transError;

      setSuccess({ msg: `Berhasil menukarkan ${amount} koin!`, amount });
      setSelectedStudent(null);
      setSearchQuery('');
      setStudents([]);
      
      // Auto close success message
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      alert('Transaksi gagal!');
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-nunito">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-white">🏪</div>
             <h1 className="text-xl font-black text-slate-800">Terminal Kantin</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-red-500 font-bold transition-all"
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400">
            <Search size={24} />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchStudents()}
            className="w-full pl-16 pr-6 py-6 bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-sm focus:outline-none focus:border-amber-400 focus:shadow-lg focus:shadow-amber-100/50 transition-all text-xl font-bold text-slate-700"
            placeholder="Cari Nama Siswa..."
          />
          <button 
            onClick={searchStudents}
            className="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-3 bg-amber-400 hover:bg-amber-500 text-white rounded-2xl font-black shadow-sm transition-all"
          >
            Cari
          </button>
        </div>

        {/* Results */}
        <div className="grid gap-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-amber-400" size={48} />
            </div>
          ) : students.length > 0 ? (
            students.map((student) => (
              <motion.div 
                key={student.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedStudent(student)}
                className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 hover:border-amber-200 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden p-1 border-2 border-slate-100">
                    <img 
                      src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${student.full_name}`} 
                      alt="Avatar" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">{student.full_name}</h3>
                    <p className="text-sm font-bold text-slate-400">Kelas {student.class} • {student.coins} Koin</p>
                  </div>
                </div>
                <div className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CheckCircle2 size={32} />
                </div>
              </motion.div>
            ))
          ) : searchQuery && !loading && (
            <div className="text-center py-12 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold">Tidak menemukan siswa dengan nama tersebut.</p>
            </div>
          )}
        </div>

        {/* Success Modal */}
        <AnimatePresence>
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm z-50 px-4"
            >
              <div className="bg-green-500 text-white p-6 rounded-3xl shadow-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Coins size={28} />
                </div>
                <div>
                  <p className="font-black text-lg leading-tight">{success.msg}</p>
                  <p className="text-green-100 font-bold text-sm">Transaksi berhasil dicatat.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Redeem Modal */}
        <AnimatePresence>
          {selectedStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedStudent(null)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
              >
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>

                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-blue-50 rounded-3xl p-2 mb-4 border-2 border-blue-100">
                    <img 
                      src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedStudent.full_name}`} 
                      alt="Avatar" 
                    />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800">{selectedStudent.full_name}</h2>
                  <div className="inline-flex items-center gap-2 px-4 py-1 bg-amber-50 text-amber-600 rounded-full text-sm font-black mt-2">
                    <Coins size={16} /> {selectedStudent.coins} Koin Tersedia
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full mt-8">
                    <button 
                      onClick={() => handleTransaction(selectedStudent.id, 5)}
                      disabled={processing || selectedStudent.coins < 5}
                      className="group p-6 bg-slate-50 hover:bg-amber-400 border-2 border-slate-100 hover:border-amber-400 rounded-3xl transition-all disabled:opacity-50"
                    >
                      <p className="text-3xl font-black text-slate-800 group-hover:text-white mb-1">5</p>
                      <p className="text-[10px] font-black uppercase text-slate-400 group-hover:text-amber-100">Koin</p>
                    </button>
                    <button 
                      onClick={() => handleTransaction(selectedStudent.id, 10)}
                      disabled={processing || selectedStudent.coins < 10}
                      className="group p-6 bg-slate-50 hover:bg-amber-400 border-2 border-slate-100 hover:border-amber-400 rounded-3xl transition-all disabled:opacity-50"
                    >
                      <p className="text-3xl font-black text-slate-800 group-hover:text-white mb-1">10</p>
                      <p className="text-[10px] font-black uppercase text-slate-400 group-hover:text-amber-100">Koin</p>
                    </button>
                  </div>
                  
                  {processing && (
                    <div className="mt-4 flex items-center gap-2 text-amber-500 font-bold">
                      <Loader2 className="animate-spin" size={18} /> Memproses...
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default KantinDashboard;
