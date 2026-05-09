import React, { useEffect, useState } from 'react';
import { auth, db } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { motion } from 'motion/react';
import { ShieldCheck, Coins, Users, History, LogOut, Loader2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  full_name: string;
  coins: number;
  class: string;
  role: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ totalCoins: 0, totalStudents: 0 });
  const [students, setStudents] = useState<Profile[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        // Fetch Students
        const studentsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'siswa'),
          orderBy('coins', 'desc')
        );
        const studentsSnap = await getDocs(studentsQuery);
        const studentData = studentsSnap.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as Profile[];
        
        setStudents(studentData);

        const totalCoins = studentData.reduce((acc, curr) => acc + (curr.coins || 0), 0);
        setStats({ totalCoins, totalStudents: studentData.length });

        // Fetch Transactions
        const transQuery = query(
          collection(db, 'transactions'),
          orderBy('created_at', 'desc'),
          limit(10)
        );
        const transSnap = await getDocs(transQuery);
        
        // Fetch student names for transactions (Simulated join)
        const transData = await Promise.all(transSnap.docs.map(async (transactionDoc) => {
          const data = transactionDoc.data();
          let studentName = 'Unknown';
          
          // Try to find in already fetched students
          const student = studentData.find(s => s.id === data.student_id);
          if (student) {
            studentName = student.full_name;
          } else if (data.student_id) {
            // Fetch from Firestore if not in top list
            const pSnap = await getDoc(doc(db, 'users', data.student_id));
            if (pSnap.exists()) {
              studentName = (pSnap.data() as Profile).full_name;
            }
          }
          
          return {
            id: transactionDoc.id,
            ...data,
            profiles: { full_name: studentName } // Match existing UI expectation
          };
        }));
        
        setTransactions(transData);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-fixed bg-cover bg-center p-4 md:p-8 font-nunito relative overflow-hidden"
      style={{ backgroundImage: "url('/background dashboard siswa.png')" }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-slate-950/60 pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 scifi-header-blue px-10 py-4 shadow-2xl">
             <div className="w-12 h-12 scifi-header-blue flex items-center justify-center text-white shadow-xl p-2">
               <ShieldCheck size={28} />
             </div>
             <div>
               <h1 className="text-xl scifi-text-header scifi-text-cyan">Admin Master Panel</h1>
               <p className="scifi-text-pink font-bold text-[10px] uppercase tracking-[0.3em] font-scifi">Command Center v2.0</p>
             </div>
          </div>
          <button 
            onClick={handleLogout}
            className="px-8 py-4 scifi-button-red text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl"
          >
            Sistem Off <LogOut size={18} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="scifi-panel-blue p-8 shadow-2xl"
          >
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mb-4 border border-amber-500/20">
              <Coins size={28} />
            </div>
            <p className="scifi-text-pink font-black uppercase tracking-widest text-[10px] font-scifi">Total Koin Beredar</p>
            <h3 className="text-5xl scifi-text-header scifi-text-cyan mt-1 tabular-nums">{stats.totalCoins}</h3>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="scifi-panel-glass p-8 shadow-2xl"
          >
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
              <Users size={28} />
            </div>
            <p className="scifi-text-pink font-black uppercase tracking-widest text-[10px] font-scifi">Total Siswa Terdaftar</p>
            <h3 className="text-5xl scifi-text-header scifi-text-cyan mt-1 tabular-nums">{stats.totalStudents}</h3>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="scifi-panel-yellow p-8 shadow-2xl"
          >
            <div className="w-12 h-12 bg-black/10 text-black rounded-2xl flex items-center justify-center mb-4 border border-black/20">
              <History size={28} />
            </div>
            <p className="text-black/60 font-black uppercase tracking-widest text-[10px] font-scifi">Aktivitas Hari Ini</p>
            <h3 className="text-5xl font-black text-black mt-1 tabular-nums font-scifi">{transactions.length}</h3>
          </motion.div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Recent Transactions */}
          <div className="col-span-12 lg:col-span-5 space-y-4">
            <h2 className="text-xl scifi-text-header scifi-text-cyan flex items-center gap-2 px-2">
              <History size={22} className="text-blue-400" /> Log Transaksi Terbaru
            </h2>
            <div className="scifi-panel-glass p-6 shadow-2xl overflow-hidden">
              <div className="space-y-4">
                {transactions.map((tx, idx) => (
                  <div key={tx.id} className={`p-4 flex items-center justify-between bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'earn' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {tx.type === 'earn' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm font-outfit">{tx.profiles?.full_name}</p>
                        <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest font-scifi">{tx.description}</p>
                      </div>
                    </div>
                    <p className={`font-black ${tx.type === 'earn' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard/Student List */}
          <div className="col-span-12 lg:col-span-7 space-y-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2 px-2">
              <Users size={22} className="text-blue-400" /> Daftar Saldo Siswa
            </h2>
            <div className="scifi-panel-glass p-0 overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-8 py-6 text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] font-scifi">Peringkat</th>
                    <th className="px-8 py-6 text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] font-scifi">Nama Siswa</th>
                    <th className="px-8 py-6 text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] font-scifi">Kelas</th>
                    <th className="px-8 py-6 text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] text-right font-scifi">Saldo Koin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {students.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-8 py-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${idx === 0 ? 'bg-yellow-500/20 text-yellow-400' : idx === 1 ? 'bg-slate-400/20 text-slate-300' : idx === 2 ? 'bg-orange-500/20 text-orange-400' : 'text-white/20'}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${idx === 0 ? 'bg-yellow-500/20 text-yellow-400' : idx === 1 ? 'bg-slate-400/20 text-slate-300' : idx === 2 ? 'bg-orange-500/20 text-orange-400' : 'text-blue-300'}`}>
                          {idx + 1}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${student.full_name}`} 
                            alt="Avatar" 
                            className="w-8 h-8 rounded-full bg-white/10 border border-white/10"
                          />
                          <span className="font-bold text-white font-outfit">{student.full_name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-blue-300 uppercase tracking-widest border border-white/10">{student.class}</span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <span className="inline-flex items-center gap-1 font-black text-white">
                          {student.coins} <Coins size={14} className="text-amber-400" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
