/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Award, Trophy, Coins, ArrowLeft, Star } from 'lucide-react';
import Certificate from './Certificate';
import { useSmartSchool } from '../context/SmartSchoolContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { fetchDriveData, getPdfUrl } from '../services/driveService';
import PdfModal from './PdfModal';
import MathText from './MathText';
import { BookOpen, Sparkles, ChevronLeft } from 'lucide-react';

interface QuestModalProps {
  onClose: () => void;
  quest?: any;
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

export default function QuestModal({ onClose, quest }: QuestModalProps) {
  const { updateStudentCoins, profile } = useSmartSchool();
  const [step, setStep] = useState<'intro' | 'reading' | 'quiz' | 'result' | 'certificate' | 'shop'>(
    quest?.isShop ? 'shop' : (quest?.isTest ? 'quiz' : 'intro')
  );
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [studentName, setStudentName] = useState(profile?.full_name || '');
  const [score, setScore] = useState(0);
  const [coinsAwarded, setCoinsAwarded] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [bookData, setBookData] = useState<any>(null);
  const [verificationCode] = useState(() => 'KS-' + Math.random().toString(36).substring(2, 6).toUpperCase());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingBook, setLoadingBook] = useState(false);

  const activeQuestions = quest?.questions || QUESTIONS;

  // Cari data buku jika ada di quest
  useState(() => {
    if (quest?.book_title) {
      setLoadingBook(true);
      fetchDriveData().then(books => {
        const found = books.find(b => b.title === quest.book_title);
        if (found) setBookData(found);
        setLoadingBook(false);
      });
    }
  });

  const startReading = () => {
    if (!studentName.trim()) return alert("Tulis namamu dulu ya!");
    setStep('reading');
  };

  const startQuiz = () => {
    setStep('quiz');
  };

  const handleFinishReading = async () => {
    if (!profile) return;
    
    // Berikan koin langsung
    const rewardAmount = quest?.reward || 10;
    const success = await updateStudentCoins(profile.id, rewardAmount, `Menyelesaikan misi baca: ${quest?.title || 'Literasi'}`);
    
    if (success) {
      setCoinsAwarded(true);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
    }

    // Catat Misi Selesai agar tidak muncul lagi di dashboard
    try {
      await addDoc(collection(db, 'completed_quests'), {
        student_id: profile.id,
        quest_id: quest.id,
        completed_at: serverTimestamp()
      });

      // Tambahkan ke Riwayat Baca agar terlihat oleh Guru dan Siswa
      if (bookData) {
        await addDoc(collection(db, 'borrow_history'), {
          student_id: profile.id,
          student_name: studentName,
          book_title: bookData.title,
          book_id: bookData.id,
          status: 'Selesai Membaca (Misi)',
          created_at: serverTimestamp()
        });
      }
    } catch (err) {
      console.error('Error marking quest as complete or saving history:', err);
    }

    setScore(100);
    setStep('result');
  };

  const handleAnswer = async (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQuestion < activeQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score
      const finalScore = newAnswers.reduce((acc, current, index) => {
        const correctIdx = activeQuestions[index].correct ?? activeQuestions[index].correctAnswer;
        return current === correctIdx ? acc + 1 : acc;
      }, 0);
      const percentageScore = (finalScore / activeQuestions.length) * 100;
      setScore(percentageScore);

      // Award quest reward if score >= 75
      if (percentageScore >= 75 && profile) {
        const rewardAmount = quest?.reward || 10;
        updateStudentCoins(profile.id, rewardAmount, `Bonus misi: ${quest?.title || 'Tantangan Literasi'} (Nilai: ${percentageScore})`)
          .then(success => {
            if (success) {
              setCoinsAwarded(true);
              setShowCelebration(true);
              setTimeout(() => setShowCelebration(false), 5000);
            }
          });
      }

      // Catat Hasil Akademik & Sertifikat jika ini adalah Ulangan (isTest)
      if (quest?.isTest && profile) {
         try {
           // Simpan Skor ke Database
           await addDoc(collection(db, 'academic_results'), {
             student_id: profile.id,
             student_name: studentName,
             test_id: quest.id,
             subject: quest.book_title || 'Umum',
             score: percentageScore,
             created_at: serverTimestamp()
           });

           // Simpan ke Riwayat Baca/Tugas
           await addDoc(collection(db, 'borrow_history'), {
             student_id: profile.id,
             student_name: studentName,
             book_title: `Ulangan: ${quest.book_title}`,
             status: `Selesai (Skor: ${percentageScore})`,
             created_at: serverTimestamp()
           });

           // Berikan Sertifikat jika Lulus (Skor >= 75)
           if (percentageScore >= 75) {
             await addDoc(collection(db, 'certificates'), {
               student_id: profile.id,
               student_name: studentName,
               quest_title: quest.title || `Ulangan: ${quest.book_title}`,
               score: percentageScore,
               date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
               created_at: serverTimestamp()
             });
           }
         } catch (err) {
           console.error('Error recording test result:', err);
         }
      }

      // Catat Misi Selesai hanya jika LULUS (Skor >= 75) atau jika ini bukan Test (Misi Baca)
      if (percentageScore >= 75 || !quest?.isTest) {
        addDoc(collection(db, 'completed_quests'), {
          student_id: profile?.id,
          quest_id: quest.id,
          completed_at: serverTimestamp()
        }).catch(err => console.error('Error marking quest as complete:', err));
      }

      setStep('result');
    }
  };

  const handleShopPurchase = async () => {
    if (!profile || !quest) return;
    
    setLoadingBook(true);
    const success = await updateStudentCoins(profile.id, -quest.price, `Beli: ${quest.name} (Toko Digital)`);
    
    if (success) {
      setCoinsAwarded(true);
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        onClose();
      }, 3000);
    }
    setLoadingBook(false);
  };

  const renderShop = () => (
    <motion.div 
      key="shop"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="relative w-full max-w-lg bg-white rounded-[3rem] p-1 shadow-2xl overflow-hidden"
    >
      <div className="bg-slate-50 p-8 rounded-[3rem]">
        <div className="flex justify-between items-start mb-8">
          <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-5xl shadow-lg border-4 border-white">
            {quest.icon || '🛍️'}
          </div>
          <button onClick={onClose} className="p-3 bg-white shadow-sm rounded-2xl text-slate-400 hover:text-slate-600 transition-all"><X size={20} /></button>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500" />
          <div className="text-center mb-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Struk Pembelian Digital</p>
            <h3 className="text-2xl font-black text-slate-800">{quest.name}</h3>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase">Harga</span>
              <div className="flex items-center gap-2 font-black text-slate-800">
                <Coins size={14} className="text-amber-500" />
                {quest.price} Koin
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase">Pembeli</span>
              <span className="font-black text-slate-800">{profile?.full_name?.split(' ')[0]}</span>
            </div>
            <div className="pt-4 border-t-2 border-dashed border-slate-100 flex justify-between items-center">
              <span className="font-black text-slate-800">Total Tagihan</span>
              <span className="text-2xl font-black text-emerald-600">{quest.price} 🪙</span>
            </div>
          </div>

          {/* Verification Code Box */}
          <div className="bg-slate-900 rounded-3xl p-6 mb-8 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 blur-2xl rounded-full -mr-10 -mt-10" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kode Verifikasi Petugas</p>
            <div className="text-4xl font-black text-white tracking-[0.2em] group-hover:scale-110 transition-transform duration-500">
              {verificationCode}
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl p-4 mb-8 border border-amber-100 text-center">
            <p className="text-[9px] font-black text-amber-600 uppercase mb-1">Penting!</p>
            <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
              Tunjukkan kode di atas kepada petugas kantin untuk memverifikasi pengambilan barangmu.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShopPurchase}
            disabled={loadingBook || coinsAwarded}
            className={`w-full h-16 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all shadow-xl ${
              coinsAwarded 
              ? 'bg-emerald-500 text-white shadow-emerald-200'
              : 'bg-slate-900 text-white shadow-slate-200 hover:bg-black'
            }`}
          >
            {loadingBook ? 'Memproses...' : (coinsAwarded ? 'Berhasil Ditukar! ✅' : 'Tukar Sekarang')}
          </motion.button>
        </div>
        
        <button onClick={onClose} className="w-full py-6 text-[10px] font-black text-slate-300 hover:text-slate-500 uppercase tracking-widest transition-colors">
          Batal dan Kembali
        </button>
      </div>
    </motion.div>
  );

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
        {step === 'shop' && renderShop()}
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
                {quest?.isTest ? <span className="text-4xl">📝</span> : (quest?.icon ? <span className="text-4xl">{quest.icon}</span> : <Trophy size={40} />)}
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-2">{quest?.isTest ? 'Ulangan Harian' : (quest?.title || 'Misi Literasi!')}</h2>
              <p className="text-slate-500 font-medium">
                {quest?.isTest ? `Mata Pelajaran: ${quest.book_title}` : (quest?.book_title ? `Tugas: Baca buku "${quest.book_title}"` : 'Selesaikan tantangan ini untuk mendapatkan koin.')}
              </p>
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
                onClick={quest?.isTest ? startQuiz : (bookData ? startReading : startQuiz)}
                disabled={loadingBook}
                className="w-full h-14 bg-blue-600 rounded-2xl text-white font-black text-lg shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loadingBook ? 'Menyiapkan...' : (bookData ? 'Mulai Membaca' : 'Mulai Kerjakan')} <ChevronRight />
              </button>
            </div>
          </motion.div>
        )}
        
        {step === 'reading' && bookData && (
          <PdfModal 
            url={getPdfUrl(bookData.driveId)} 
            title={bookData.title} 
            onClose={quest?.isTest ? startQuiz : handleFinishReading} 
          />
        )}

        {step === 'quiz' && (
          <motion.div 
            key="quiz"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="relative w-full max-w-xl bg-white rounded-[2rem] p-10 shadow-2xl"
          >
            <div className="mb-6">
               <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">
                 {quest?.isTest ? `Ulangan: ${quest.book_title}` : (quest?.title || 'Tantangan Literasi')}
               </h4>
               <div className="flex justify-between items-center">
                  <span className="bg-slate-100 px-4 py-1.5 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     Pertanyaan {currentQuestion + 1} dari {activeQuestions.length}
                  </span>
                  <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-blue-500 transition-all duration-500" 
                       style={{ width: `${((currentQuestion + 1) / activeQuestions.length) * 100}%` }} 
                     />
                  </div>
               </div>
            </div>

            <MathText 
              text={activeQuestions[currentQuestion].question}
              className="text-2xl font-black text-slate-800 mb-8 leading-tight"
            />

            {activeQuestions[currentQuestion].image && (
              <div className="mb-8 rounded-2xl overflow-hidden border-2 border-slate-100">
                <img 
                  src={activeQuestions[currentQuestion].image} 
                  alt="Question" 
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            <div className={`grid gap-4 ${activeQuestions[currentQuestion].options.some((o: any) => typeof o === 'object' || (typeof o === 'string' && o.startsWith('http'))) ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {activeQuestions[currentQuestion].options.map((option: any, idx: number) => {
                const isImageOption = typeof option === 'object' ? !!option.image : (typeof option === 'string' && option.startsWith('http'));
                const optionText = typeof option === 'object' ? option.text : (isImageOption ? '' : option);
                const optionImg = typeof option === 'object' ? option.image : (isImageOption ? option : null);

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full p-6 text-left rounded-2xl border-2 border-slate-100 hover:border-blue-400 hover:bg-blue-50 font-bold text-slate-700 transition-all active:scale-98 flex flex-col items-center gap-3`}
                  >
                    {optionImg && (
                      <img src={optionImg} alt={`Option ${idx}`} className="w-full h-32 object-contain rounded-lg" />
                    )}
                    {optionText && <MathText text={optionText} className="w-full" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div 
            key="result"
            className="relative w-full max-w-lg bg-white rounded-[2rem] p-10 shadow-2xl text-center"
          >
            <div className={`inline-flex h-24 w-24 items-center justify-center rounded-3xl mb-8 ${score >= 75 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
               {score >= 75 ? <Award size={56} /> : <X size={56} />}
            </div>
            
            <h2 className="text-3xl font-black text-slate-800 mb-4">
              {score >= 75 ? 'Misi Selesai!' : 'Coba Lagi!'}
            </h2>
            <p className="text-slate-500 mb-8 font-medium">
              Nilai kamu: <span className="font-black text-slate-800">{Math.round(score)}</span>. 
              {score >= 75 ? `Kamu telah menyelesaikan "${quest?.title}".` : `Maaf, kamu butuh nilai minimal 75 untuk lulus. Ayo belajar lagi!`}
            </p>

            {/* Coin Reward Banner */}
            {coinsAwarded && score >= 75 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="mb-8 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-2xl p-4 flex items-center justify-center gap-3 shadow-lg shadow-amber-200/50"
              >
                <motion.div
                  animate={{ rotateY: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Coins size={24} className="text-amber-800" />
                </motion.div>
                <span className="font-black text-amber-900">
                  +{quest?.reward || 10} Koin Berhasil Didapat! 🎉
                </span>
              </motion.div>
            )}

            <div className="flex flex-col gap-3">
              {score >= 75 ? (
                <button 
                  onClick={quest?.isTest ? () => setStep('certificate') : onClose}
                  className="w-full h-14 bg-blue-600 rounded-2xl text-white font-black text-lg shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
                >
                  {quest?.isTest ? 'Lihat Sertifikat' : 'Kembali ke Dashboard'}
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setStep('quiz');
                    setCurrentQuestion(0);
                    setAnswers([]);
                  }}
                  className="w-full h-14 bg-orange-500 rounded-2xl text-white font-black text-lg shadow-lg hover:bg-orange-600 active:scale-95 transition-all"
                >
                  Ulangi Ulangan
                </button>
              )}
              <button 
                onClick={onClose}
                className="w-full h-14 bg-slate-100 rounded-2xl text-slate-500 font-black text-lg hover:bg-slate-200 active:scale-95 transition-all"
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
                 questTitle={quest?.title || 'Ulangan Harian'} 
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

      {/* Premium Coin Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
          >
            {/* Background Glow */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 2, opacity: [0, 0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute w-96 h-96 bg-amber-400 rounded-full blur-[100px]"
            />
            
            <div className="relative flex flex-col items-center">
              {/* Floating Coins Animation */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 0, x: 0, opacity: 1, scale: 0 }}
                  animate={{ 
                    y: -400 - Math.random() * 200, 
                    x: (Math.random() - 0.5) * 600,
                    opacity: 0,
                    scale: 1 + Math.random(),
                    rotate: 360 * 2
                  }}
                  transition={{ duration: 2, delay: i * 0.1, ease: "easeOut" }}
                  className="absolute text-amber-400"
                >
                  <Coins size={40} className="drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
                </motion.div>
              ))}

              {/* Main Banner */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                className="bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(180,83,9,0.4)] border-4 border-white/50 text-center relative z-10"
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-2">
                   {[...Array(3)].map((_, i) => (
                     <motion.div
                       key={i}
                       animate={{ y: [0, -10, 0], scale: [1, 1.2, 1] }}
                       transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                       className="text-white drop-shadow-lg"
                     >
                       <Star fill="white" size={32} />
                     </motion.div>
                   ))}
                </div>
                
                <h4 className="text-amber-900 font-black text-xl uppercase tracking-tighter mb-1">
                  {quest?.isShop ? 'PEMBELIAN BERHASIL!' : 'MISI BERHASIL!'}
                </h4>
                <div className="flex items-center justify-center gap-4 my-2">
                   <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-inner text-4xl">
                      {quest?.isShop ? (quest?.icon || '🛍️') : <Coins size={36} className="text-amber-500 animate-bounce" />}
                   </div>
                   <span className="text-6xl font-black text-amber-950 drop-shadow-md">
                     {quest?.isShop ? '' : '+'} {quest?.isShop ? '' : (quest?.reward || 10)}
                   </span>
                </div>
                <p className="text-amber-800 font-black text-lg">
                  {quest?.isShop ? quest?.name : 'KOIN BARU DIPEROLEH!'}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
