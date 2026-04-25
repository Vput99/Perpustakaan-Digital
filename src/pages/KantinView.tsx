import { motion } from 'motion/react';
import { Store, Coins, Receipt } from 'lucide-react';

export default function KantinView() {
  // Mock data
  const students = [
    { id: 1, name: 'Budi Santoso', kelas: 3, koin: 450 },
    { id: 2, name: 'Siti Aminah', kelas: 5, koin: 1200 },
    { id: 3, name: 'Rina Wijaya', kelas: 1, koin: 300 },
  ];

  const transactions = [
    { id: 'TRX-001', student: 'Siti Aminah', item: 'Buku Tulis', cost: 500, time: '10:30' },
    { id: 'TRX-002', student: 'Budi Santoso', item: 'Pensil', cost: 150, time: '09:15' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-100 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
              <Store size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">Dashboard Kantin</h1>
              <p className="text-sm font-medium text-slate-500">Kelola koin dan transaksi siswa</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Balances */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-100"
          >
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Coins className="text-yellow-500" /> Saldo Koin Siswa
            </h2>

            <div className="space-y-3">
              {students.map(student => (
                <div key={student.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-800">{student.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">Kelas {student.kelas}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1.5 rounded-xl">
                    <Coins size={16} className="text-yellow-600" />
                    <span className="font-black text-yellow-700">{student.koin}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Transactions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-100"
          >
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Receipt className="text-green-600" /> Transaksi Hari Ini
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-slate-500">
                    <th className="pb-3 font-bold">ID</th>
                    <th className="pb-3 font-bold">Siswa</th>
                    <th className="pb-3 font-bold">Barang</th>
                    <th className="pb-3 font-bold">Koin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.map(trx => (
                    <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-mono text-xs text-slate-400">{trx.id}</td>
                      <td className="py-3 font-bold text-slate-700">{trx.student}</td>
                      <td className="py-3 text-slate-600">{trx.item}</td>
                      <td className="py-3 font-black text-red-500">-{trx.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
