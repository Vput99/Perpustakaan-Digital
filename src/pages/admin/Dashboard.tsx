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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-nunito">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-white">
               <ShieldCheck size={28} />
             </div>
             <div>
               <h1 className="text-2xl font-black text-slate-800 tracking-tight">Admin Master Panel</h1>
               <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Sistem SmartSchool</p>
             </div>
          </div>
          <button 
            onClick={handleLogout}
            className="px-6 py-3 bg-white text-slate-600 rounded-2xl border-2 border-slate-100 font-black flex items-center gap-2 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
          >
            Log Out <LogOut size={18} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm"
          >
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-4">
              <Coins size={28} />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Total Koin Beredar</p>
            <h3 className="text-4xl font-black text-slate-800 mt-1">{stats.totalCoins}</h3>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
              <Users size={28} />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Total Siswa Terdaftar</p>
            <h3 className="text-4xl font-black text-slate-800 mt-1">{stats.totalStudents}</h3>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl"
          >
            <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-4">
              <History size={28} />
            </div>
            <p className="text-slate-300 font-bold uppercase tracking-widest text-xs">Aktivitas Hari Ini</p>
            <h3 className="text-4xl font-black mt-1">{transactions.length}</h3>
          </motion.div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Recent Transactions */}
          <div className="col-span-12 lg:col-span-5 space-y-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 px-2">
              <History size={22} className="text-slate-400" /> Log Transaksi Terbaru
            </h2>
            <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-sm overflow-hidden">
              <div className="p-2">
                {transactions.map((tx, idx) => (
                  <div key={tx.id} className={`p-4 flex items-center justify-between ${idx !== transactions.length - 1 ? 'border-b-2 border-slate-50' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'earn' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                        {tx.type === 'earn' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                      </div>
                      <div>
                        <p className="font-black text-slate-800">{tx.profiles?.full_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{tx.description}</p>
                      </div>
                    </div>
                    <p className={`font-black ${tx.type === 'earn' ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard/Student List */}
          <div className="col-span-12 lg:col-span-7 space-y-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 px-2">
              <Users size={22} className="text-slate-400" /> Daftar Saldo Siswa
            </h2>
            <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b-2 border-slate-100">
                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Peringkat</th>
                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Nama Siswa</th>
                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Kelas</th>
                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Saldo Koin</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-50">
                  {students.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-600' : idx === 1 ? 'bg-slate-100 text-slate-600' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'text-slate-400'}`}>
                          {idx + 1}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${student.full_name}`} 
                            alt="Avatar" 
                            className="w-8 h-8 rounded-full bg-slate-100"
                          />
                          <span className="font-bold text-slate-700">{student.full_name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-black text-slate-500 uppercase">{student.class}</span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <span className="inline-flex items-center gap-1 font-black text-slate-800">
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
