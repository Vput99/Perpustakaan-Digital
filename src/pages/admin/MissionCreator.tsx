import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Sparkles, Send, BookOpen, Trophy, 
  Trash2, Brain, Wand2, ArrowLeft, Coins,
  Type, Smile, ClipboardList, HelpCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fetchDriveData } from '../../services/driveService';

interface MissionCreatorProps {
  onBack: () => void;
  onSuccess: (message: string) => void;
}

export default function MissionCreator({ onBack, onSuccess }: MissionCreatorProps) {
  const [activeMode, setActiveMode] = useState<'manual' | 'ai' | 'test'>('manual');
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<any[]>([]);

  useEffect(() => {
    const loadBooks = async () => {
      const data = await fetchDriveData();
      setBooks(data.filter(i => i.category === 'Buku Pelajaran'));
    };
    loadBooks();
  }, []);
  
  // Manual Form State
  const [title, setTitle] = useState('');
  const [reward, setReward] = useState(25);
  const [icon, setIcon] = useState('📖');

  // AI Form State
  const [topic, setTopic] = useState('');
  const [aiResult, setAiResult] = useState<{ question: string, reward: number }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Daily Test State
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('1');
  const [questions, setQuestions] = useState<{ q: string, a: string, b: string, c: string, d: string, correct: string }[]>([
    { q: '', a: '', b: '', c: '', d: '', correct: 'a' }
  ]);

  const addQuestion = () => {
    setQuestions([...questions, { q: '', a: '', b: '', c: '', d: '', correct: 'a' }]);
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('daily_tests')
        .insert({
          book_title: selectedBook,
          chapter: selectedChapter,
          questions: questions,
          created_at: new Date().toISOString()
        });

      if (error) {
        // If daily_tests table doesn't exist, we'll try to store as a special quest for now
        const { error: questError } = await supabase.from('quests').insert({
          title: `Ulangan: ${selectedBook} (Bab ${selectedChapter})`,
          reward: 50,
          icon: '📝',
          description: JSON.stringify({ chapter: selectedChapter, questions }),
          created_at: new Date().toISOString()
        });
        if (questError) throw questError;
      }
      
      onSuccess(`Soal Ulangan untuk "${selectedBook}" berhasil dibuat!`);
      onBack();
    } catch (err: any) {
      alert('Gagal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('quests')
        .insert({
          title,
          reward,
          icon,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      onSuccess(`Misi "${title}" berhasil dibuat!`);
      onBack();
    } catch (err: any) {
      alert('Gagal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateAIQuestions = () => {
    setIsGenerating(true);
    setAiResult([]);
    
    // Simulate AI generation
    setTimeout(() => {
      const results = [
        { question: `Sebutkan 3 tokoh utama dalam cerita ${topic}?`, reward: 10 },
        { question: `Apa pesan moral yang bisa diambil dari ${topic}?`, reward: 15 },
        { question: `Buatlah rangkuman singkat tentang ${topic}.`, reward: 20 },
      ];
      setAiResult(results);
      setIsGenerating(false);
    }, 2000);
  };

  const handleAssignAiMissions = async () => {
    setLoading(true);
    try {
      const missions = aiResult.map(r => ({
        title: r.question,
        reward: r.reward,
        icon: '🤖',
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('quests').insert(missions);
      if (error) throw error;

      onSuccess(`${aiResult.length} Misi AI berhasil ditugaskan!`);
      onBack();
    } catch (err: any) {
      alert('Gagal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-800">Mission Center</h1>
              <p className="text-sm font-medium text-slate-400">Buat tantangan belajar untuk siswa</p>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-slate-200/50 p-1.5 rounded-3xl w-full md:w-fit overflow-x-auto">
          <button 
            onClick={() => setActiveMode('manual')}
            className={`whitespace-nowrap px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${activeMode === 'manual' ? 'bg-white text-blue-600 shadow-xl shadow-blue-100' : 'text-slate-400'}`}
          >
            <Plus size={18} /> Manual
          </button>
          <button 
            onClick={() => setActiveMode('ai')}
            className={`whitespace-nowrap px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${activeMode === 'ai' ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100' : 'text-slate-400'}`}
          >
            <Sparkles size={18} /> AI Assistant
          </button>
          <button 
            onClick={() => setActiveMode('test')}
            className={`whitespace-nowrap px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${activeMode === 'test' ? 'bg-white text-emerald-600 shadow-xl shadow-emerald-100' : 'text-slate-400'}`}
          >
            <ClipboardList size={18} /> Ulangan Harian
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-12">
            <AnimatePresence mode="wait">
              {activeMode === 'manual' ? (
                // ... (existing manual code)
                <motion.div
                  key="manual"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-[3rem] p-10 shadow-sm border-2 border-slate-100"
                >
                  <form onSubmit={handleCreateManual} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                          <Type size={14} /> Judul Misi
                        </label>
                        <input 
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Contoh: Baca Buku Si Kancil"
                          className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-400 focus:bg-white transition-all font-bold text-slate-700"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                          <Coins size={14} /> Hadiah Koin
                        </label>
                        <input 
                          type="number"
                          required
                          value={reward}
                          onChange={(e) => setReward(parseInt(e.target.value))}
                          className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-400 focus:bg-white transition-all font-bold text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                        <Smile size={14} /> Pilih Ikon
                      </label>
                      <div className="flex flex-wrap gap-4">
                        {['📖', '📚', '🔍', '⭐', '🧩', '🧪', '🎨', '🏆'].map(i => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setIcon(i)}
                            className={`w-14 h-14 rounded-2xl text-2xl flex items-center justify-center transition-all ${icon === i ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                          >
                            {i}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black text-lg shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3"
                    >
                      {loading ? <Brain className="animate-spin" /> : <><Send size={22} /> Buat Misi Sekarang</>}
                    </button>
                  </form>
                </motion.div>
              ) : activeMode === 'ai' ? (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Brain size={120} className="text-white" />
                  </div>

                  <div className="relative z-10 space-y-8">
                    <div className="max-w-2xl">
                      <h2 className="text-3xl font-black text-white mb-2">AI Smart Task Builder</h2>
                      <p className="text-slate-400 font-medium">Tuliskan topik atau judul buku, AI akan membuatkan pertanyaan untuk misi siswa.</p>
                    </div>

                    <div className="flex gap-4">
                      <input 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Ketik topik (misal: Malun Kundang, Ekosistem, dll)"
                        className="flex-1 px-8 py-5 bg-white/5 border-2 border-white/10 rounded-3xl text-white font-bold focus:border-indigo-400 transition-all outline-none"
                      />
                      <button 
                        onClick={generateAIQuestions}
                        disabled={isGenerating || !topic}
                        className="px-8 bg-indigo-500 hover:bg-indigo-600 text-white rounded-3xl font-black flex items-center gap-3 transition-all disabled:opacity-50"
                      >
                        {isGenerating ? <Wand2 className="animate-spin" /> : <><Sparkles size={20} /> Generate</>}
                      </button>
                    </div>

                    <AnimatePresence>
                      {aiResult.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-4 pt-8 border-t border-white/10"
                        >
                          <h3 className="text-white font-black uppercase tracking-widest text-xs ml-2">Hasil Rekomendasi Misi:</h3>
                          {aiResult.map((res, i) => (
                            <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/10 flex items-center justify-between group">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-300">
                                  {i + 1}
                                </div>
                                <p className="text-white font-bold">{res.question}</p>
                              </div>
                              <span className="text-indigo-400 font-black">+{res.reward} KOIN</span>
                            </div>
                          ))}

                          <button 
                            onClick={handleAssignAiMissions}
                            disabled={loading}
                            className="w-full py-5 bg-white text-slate-900 rounded-3xl font-black text-lg hover:bg-indigo-50 transition-all mt-4 flex items-center justify-center gap-3"
                          >
                            <Send size={22} /> Tugaskan Semua Misi AI
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="test"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-[3rem] p-10 shadow-sm border-2 border-slate-100"
                >
                  <form onSubmit={handleCreateTest} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                      <div className="md:col-span-8 space-y-3">
                        <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                          <BookOpen size={14} /> Pilih Buku Pembelajaran
                        </label>
                        <select 
                          required
                          value={selectedBook}
                          onChange={(e) => setSelectedBook(e.target.value)}
                          className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-400 focus:bg-white transition-all font-bold text-slate-700 appearance-none"
                        >
                          <option value="">Pilih Buku...</option>
                          {books.map(b => (
                            <option key={b.id} value={b.title}>{b.title}</option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-4 space-y-3">
                        <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                          <ClipboardList size={14} /> Bab ke-
                        </label>
                        <input 
                          type="number"
                          required
                          min="1"
                          value={selectedChapter}
                          onChange={(e) => setSelectedChapter(e.target.value)}
                          className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-400 focus:bg-white transition-all font-bold text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                          <HelpCircle className="text-emerald-500" /> Daftar Soal
                        </h3>
                        <button 
                          type="button"
                          onClick={addQuestion}
                          className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-black text-xs hover:bg-emerald-100 transition-all"
                        >
                          + Tambah Soal
                        </button>
                      </div>

                      {questions.map((q, idx) => (
                        <div key={idx} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                          <div className="flex gap-4">
                            <span className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center font-black shrink-0">{idx + 1}</span>
                            <input 
                              required
                              placeholder="Masukkan Pertanyaan..."
                              value={q.q}
                              onChange={(e) => {
                                const newQs = [...questions];
                                newQs[idx].q = e.target.value;
                                setQuestions(newQs);
                              }}
                              className="flex-1 bg-transparent border-b-2 border-slate-200 focus:border-emerald-400 outline-none font-bold text-slate-700"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-12">
                            {['a', 'b', 'c', 'd'].map(opt => (
                              <div key={opt} className="flex items-center gap-3">
                                <input 
                                  type="radio"
                                  name={`correct-${idx}`}
                                  checked={q.correct === opt}
                                  onChange={() => {
                                    const newQs = [...questions];
                                    newQs[idx].correct = opt;
                                    setQuestions(newQs);
                                  }}
                                />
                                <span className="text-xs font-black text-slate-400 uppercase">{opt}.</span>
                                <input 
                                  required
                                  placeholder={`Pilihan ${opt.toUpperCase()}`}
                                  value={(q as any)[opt]}
                                  onChange={(e) => {
                                    const newQs = [...questions];
                                    (newQs[idx] as any)[opt] = e.target.value;
                                    setQuestions(newQs);
                                  }}
                                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl font-black text-lg shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-3"
                    >
                      {loading ? <Brain className="animate-spin" /> : <><Send size={22} /> Simpan Soal Ulangan</>}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
