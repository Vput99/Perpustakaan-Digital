import { motion } from 'motion/react';
import { Users, ShieldAlert, ListChecks, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function AdminView() {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  // Mock data
  const students = [
    { id: 1, name: 'Budi Santoso', kelas: 3, status: 'Online' },
    { id: 2, name: 'Siti Aminah', kelas: 5, status: 'Online' },
    { id: 3, name: 'Andi Saputra', kelas: 3, status: 'Offline' },
    { id: 4, name: 'Rina Wijaya', kelas: 1, status: 'Online' },
  ];

  const filteredStudents = selectedClass
    ? students.filter(s => s.kelas === selectedClass)
    : students;

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
            <div className="h-12 w-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">Dashboard Admin</h1>
              <p className="text-sm font-medium text-slate-500">Pantau siswa dan berikan misi belajar</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Students List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-4"
          >
            <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="text-blue-600" /> Data Siswa Login
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedClass(null)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${!selectedClass ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Semua
                  </button>
                  {[1, 2, 3, 4, 5, 6].map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedClass(c)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${selectedClass === c ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                    >
                      Kls {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredStudents.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div>
                      <h3 className="font-bold text-slate-800">{student.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">Kelas {student.kelas}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${student.status === 'Online' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                      <span className="text-xs font-bold text-slate-600">{student.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Quests */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-100"
          >
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <ListChecks className="text-indigo-600" /> Berikan Misi
            </h2>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                <h3 className="font-bold text-indigo-900 mb-1">Misi Membaca (Kelas 1-3)</h3>
                <p className="text-xs text-indigo-700 mb-3">Baca 2 buku cerita nusantara</p>
                <button className="w-full py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} /> Tugaskan
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
                <h3 className="font-bold text-orange-900 mb-1">Misi Numerasi (Kelas 4-6)</h3>
                <p className="text-xs text-orange-700 mb-3">Selesaikan kuis matematika dasar</p>
                <button className="w-full py-2 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} /> Tugaskan
                </button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
