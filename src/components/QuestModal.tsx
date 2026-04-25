/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Award, Trophy, Coins } from 'lucide-react';
import Certificate from './Certificate';
import { useSmartSchool } from '../context/SmartSchoolContext';

interface QuestModalProps {
  onClose: () => void;
}

const QUESTIONS = [
  {
    id: 1,
    question: "Apa manfaat utama dari rajin membaca buku?",
    options: ["Biar cepat ngantuk", "Menambah ilmu dan pintar", "Biar buku cepat habis"],
    correctAnswer: 1
  },
  {
    id: 2,
    question: "Berapakah hasil dari 7 + 5?",
    options: ["10", "11", "12"],
    correctAnswer: 2
  },
  {
    id: 3,
    question: "Jika kamu ingin mencari video pembelajaran, kategori mana yang kamu pilih?",
    options: ["Buku Cerita", "Video", "Buku Pelajaran"],
    correctAnswer: 1
  },
  {
    id: 4,
    question: "Budi punya 3 apel, lalu ia membeli 4 apel lagi. Berapa jumlah apel Budi sekarang?",
    options: ["7", "6", "8"],
    correctAnswer: 0
  },
  {
    id: 5,
    question: "Siapakah pahlawan yang paling hebat di sekolah?",
    options: ["Siswa yang rajin belajar", "Siswa yang suka jajan", "Siswa yang tidak mau baca"],
    correctAnswer: 0
  }
];

export default function QuestModal({ onClose }: QuestModalProps) {
  const { updateStudentCoins, profile } = useSmartSchool();
  const [step, setStep] = useState<'intro' | 'quiz' | 'result' | 'certificate'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [studentName, setStudentName] = useState(profile?.full_name || '');
  const [score, setScore] = useState(0);
  const [coinsAwarded, setCoinsAwarded] = useState(false);

  const startQuiz = () => {
    if (!studentName.trim()) return alert("Tulis namamu dulu ya!");
    setStep('quiz');
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score
      const finalScore = newAnswers.reduce((acc, current, index) => {
        return current === QUESTIONS[index].correctAnswer ? acc + 1 : acc;
      }, 0);
      const percentageScore = (finalScore / QUESTIONS.length) * 100;
      setScore(percentageScore);

      // Award 10 coins if score >= 80
      if (percentageScore >= 80 && profile) {
        updateStudentCoins(profile.id, 10, `Bonus kuis: Tantangan Literasi (Nilai: ${percentageScore})`)
          .then(success => {
            if (success) setCoinsAwarded(true);
          });
      }

      setStep('result');
    }
  };

  const isSuccess = score >= 60; // Min 3 dari 5 benar (60%)
  const isCoinEligible = score >= 80; // Min 80 untuk mendapatkan koin

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div 
            key="intro"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-lg bg-white rounded-[2rem] p-8 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-purple-400" />
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"><X /></button>
            
            <div className="text-center mb-8">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100 text-blue-600 mb-6">
                <Trophy size={40} />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-2">Misi Literasi!</h2>
              <p className="text-slate-500 font-medium">Selesaikan tantangan ini untuk mendapatkan sertifikat resmi.</p>
            </div>

            <div className="space-y-4">
              <div>
                 <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">Siapa Namamu?</label>
                 <input 
                   type="text" 
                   value={studentName}
                   onChange={(e) => setStudentName(e.target.value)}
                   placeholder="Tulis nama lengkapmu di sini..." 
                   className="w-full h-14 bg-slate-50 rounded-2xl px-6 border-2 border-slate-100 focus:border-blue-400 focus:outline-none font-bold text-slate-800"
                 />
              </div>
              <button 
                onClick={startQuiz}
                className="w-full h-14 bg-blue-600 rounded-2xl text-white font-black text-lg shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Mulai Tantangan <ChevronRight />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'quiz' && (
          <motion.div 
            key="quiz"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="relative w-full max-w-xl bg-white rounded-[2rem] p-10 shadow-2xl"
          >
            <div className="mb-8 flex justify-between items-center">
               <span className="bg-slate-100 px-4 py-1.5 rounded-full text-xs font-black text-slate-400 uppercase tracking-widest">
                 Tantangan {currentQuestion + 1} dari {QUESTIONS.length}
               </span>
               <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500" 
                    style={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }} 
                  />
               </div>
            </div>

            <h3 className="text-2xl font-black text-slate-800 mb-8 leading-tight">
              {QUESTIONS[currentQuestion].question}
            </h3>

            <div className="grid gap-4">
              {QUESTIONS[currentQuestion].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className="w-full p-6 text-left rounded-2xl border-2 border-slate-100 hover:border-blue-400 hover:bg-blue-50 font-bold text-slate-700 transition-all active:scale-98"
                >
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div 
            key="result"
            className="relative w-full max-w-lg bg-white rounded-[2rem] p-10 shadow-2xl text-center"
          >
            <div className={`inline-flex h-24 w-24 items-center justify-center rounded-3xl mb-8 ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
               {isSuccess ? <Award size={56} /> : <X size={56} />}
            </div>
            
            <h2 className="text-3xl font-black text-slate-800 mb-4">
              {isSuccess ? 'Luar Biasa, Kamu Berhasil!' : 'Ayo Belajar Lagi!'}
            </h2>
            <p className="text-slate-500 mb-4 font-medium">
              Nilai kamu adalah <span className="font-black text-slate-800">{score}</span>. 
              {isSuccess ? ' Kamu berhak mendapatkan sertifikat pahlawan!' : ' Kamu butuh nilai minimal 60 untuk dapat sertifikat.'}
            </p>

            {/* Coin Reward Banner */}
            {coinsAwarded && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="mb-6 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-2xl p-4 flex items-center justify-center gap-3 shadow-lg shadow-amber-200/50"
              >
                <motion.div
                  animate={{ rotateY: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Coins size={24} className="text-amber-800" />
                </motion.div>
                <span className="font-black text-amber-900">
                  +10 Koin Diterima! 🎉
                </span>
              </motion.div>
            )}
            {isCoinEligible && !coinsAwarded && (
              <div className="mb-6 bg-slate-100 rounded-2xl p-4 text-center">
                <p className="text-sm font-bold text-slate-500">Koin sudah pernah diberikan sebelumnya</p>
              </div>
            )}

            <div className="grid gap-3">
              {isSuccess ? (
                <button 
                  onClick={() => setStep('certificate')}
                  className="w-full h-14 bg-blue-600 rounded-2xl text-white font-black text-lg shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
                >
                  Lihat Sertifikat
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setStep('quiz');
                    setCurrentQuestion(0);
                    setAnswers([]);
                  }}
                  className="w-full h-14 bg-slate-800 rounded-2xl text-white font-black text-lg shadow-lg hover:bg-slate-700 active:scale-95 transition-all"
                >
                  Coba Lagi
                </button>
              )}
              <button 
                onClick={onClose}
                className="w-full h-14 bg-white rounded-2xl text-slate-500 font-black text-lg border-2 border-slate-100 hover:bg-slate-50 active:scale-95 transition-all"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        )}

        {step === 'certificate' && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-8 bg-slate-900/90 overflow-y-auto">
             <div className="min-h-full w-full flex items-center justify-center py-10">
               <Certificate 
                 studentName={studentName} 
                 questTitle="Tantangan Literasi Dasar" 
                 date={new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                 onClose={onClose}
               />
               <button 
                 onClick={onClose}
                 className="fixed top-8 right-8 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
               >
                 <X size={32} />
               </button>
             </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
