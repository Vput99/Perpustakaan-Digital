/**
 * KantinAdmin - Halaman Kantin Sehat (Merchant View)
 * Allows admin to view all items like a store and select a student to process redemptions.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Coins, 
  Cookie, 
  CupSoda, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Sparkles, 
  ShoppingBag, 
  History,
  User,
  X,
  ChevronRight,
  TrendingUp,
  Tag,
  Plus,
  PackagePlus,
  Image as ImageIcon,
  Edit2,
  Trash2
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, updateDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { useSmartSchool } from '../context/SmartSchoolContext';
import type { Student, TransactionLog } from '../types';

interface KantinAdminProps {
  onBack: () => void;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

const ITEMS = [
  { id: '1', name: 'Pensil 2B High Quality', icon: '✏️', price: 2, stock: 45, image: 'https://cdn-icons-png.flaticon.com/512/588/588395.png', category: 'Alat Tulis' },
  { id: '2', name: 'Penghapus Putih Bersih', icon: '🧹', price: 2, stock: 12, image: 'https://cdn-icons-png.flaticon.com/512/2619/2619313.png', category: 'Alat Tulis' },
  { id: '3', name: 'Penggaris 30cm Transparan', icon: '📏', price: 3, stock: 8, image: 'https://cdn-icons-png.flaticon.com/512/2965/2965223.png', category: 'Alat Tulis' },
  { id: '4', name: 'Rautan Putar Otomatis', icon: '⚙️', price: 3, stock: 0, image: 'https://cdn-icons-png.flaticon.com/512/3067/3067451.png', category: 'Alat Tulis' },
  { id: '5', name: 'Buku Tulis Sidu 38 Lembar', icon: '📓', price: 5, stock: 60, image: 'https://cdn-icons-png.flaticon.com/512/3389/3389152.png', category: 'Buku' },
  { id: '6', name: 'Snack Sehat Gandum', icon: '🍪', price: 5, stock: 15, image: 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png', category: 'Makanan' },
  { id: '7', name: 'Kotak Pensil Karakter', icon: '👝', price: 8, stock: 4, image: 'https://cdn-icons-png.flaticon.com/512/3067/3067512.png', category: 'Aksesori' },
  { id: '8', name: 'Susu Kotak Ultra Milk', icon: '🥛', price: 10, stock: 10, image: 'https://cdn-icons-png.flaticon.com/512/2405/2405479.png', category: 'Minuman' },
  { id: '9', name: 'Paket Belajar Lengkap', icon: '🎁', price: 20, stock: 5, image: 'https://cdn-icons-png.flaticon.com/512/4230/4230633.png', category: 'Paket' },
];

export default function KantinAdmin({ onBack }: KantinAdminProps) {
  const { searchStudents, updateStudentCoins, transactionLogs, students, showToast, showConfirm } = useSmartSchool();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Student[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [canteenItems, setCanteenItems] = useState<any[]>(ITEMS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Alat Tulis',
    price: 0,
    stock: 0,
    image: '',
    icon: '📦'
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setNewItem({ name: '', category: 'Alat Tulis', price: 0, stock: 0, image: '', icon: '📦' });
    setEditingItem(null);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      category: item.category || 'Alat Tulis',
      price: item.price,
      stock: item.stock,
      image: item.image || '',
      icon: item.icon || '📦'
    });
    setShowAddItemModal(true);
  };

  useEffect(() => {
    const fetchCanteenItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'canteen_items'));
        if (!querySnapshot.empty) {
          const itemsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCanteenItems(itemsData);
        } else {
          // If empty, initialize with default ITEMS if needed
          // setCanteenItems(ITEMS);
        }
      } catch (err) {
        console.error("Error fetching canteen items:", err);
      }
    };
    fetchCanteenItems();
  }, []);

  useEffect(() => {
    if (query.trim()) {
      setResults(searchStudents(query));
    } else {
      setResults([]);
    }
  }, [query, searchStudents, students]);



  const handleExchange = async (item: any) => {
    if (!selectedStudent) {
      showToast('Pilih siswa terlebih dahulu untuk menukarkan barang!', 'error');
      inputRef.current?.focus();
      return;
    }

    if (item.stock <= 0) {
      showToast('Maaf, stok barang sedang habis!', 'error');
      return;
    }

    if (selectedStudent.coins < item.price) {
      showToast(`Koin ${selectedStudent.name} tidak cukup! (Saldo: ${selectedStudent.coins})`, 'error');
      return;
    }

    const success = await updateStudentCoins(selectedStudent.id, -item.price, `Tukar ${item.name} (${item.price} Koin)`);
    if (success) {
      showToast(`✅ Berhasil! ${selectedStudent.name} menukar ${item.name}`, 'success');
      
      // Deduct stock in Firestore
      try {
        const itemRef = doc(db, 'canteen_items', item.id);
        await updateDoc(itemRef, {
          stock: item.stock - 1
        });
        // Update local state
        setCanteenItems(prev => prev.map(i => i.id === item.id ? { ...i, stock: i.stock - 1 } : i));
      } catch (err) {
        console.error("Error updating stock:", err);
      }

      // Update selected student coins locally
      setSelectedStudent(prev => prev ? { ...prev, coins: prev.coins - item.price } : null);
    } else {
      showToast('Gagal memproses transaksi.', 'error');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return showToast('Nama dan Harga harus diisi!', 'error');
    
    setIsSubmitting(true);
    try {
      if (editingItem) {
        // Update existing item
        const itemRef = doc(db, 'canteen_items', editingItem.id);
        await updateDoc(itemRef, {
          ...newItem,
          updated_at: serverTimestamp()
        });
        
        setCanteenItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...newItem } : i));
        showToast('Barang berhasil diperbarui!', 'success');
      } else {
        // Add new item
        const docRef = await addDoc(collection(db, 'canteen_items'), {
          ...newItem,
          created_at: serverTimestamp()
        });
        
        const addedItem = { id: docRef.id, ...newItem };
        setCanteenItems(prev => [addedItem, ...prev]);
        showToast('Barang berhasil ditambahkan ke katalog!', 'success');
      }
      setShowAddItemModal(false);
      resetForm();
    } catch (err) {
      console.error("Error saving item:", err);
      showToast('Gagal menyimpan barang.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger exchange flow
    const confirmed = await showConfirm(
      'Hapus Barang?',
      'Apakah Anda yakin ingin menghapus barang ini dari katalog? Tindakan ini tidak dapat dibatalkan.'
    );
    
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'canteen_items', id));
      setCanteenItems(prev => prev.filter(i => i.id !== id));
      showToast('Barang berhasil dihapus!', 'success');
    } catch (err) {
      console.error("Error deleting item:", err);
      showToast('Gagal menghapus barang.', 'error');
    }
  };

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'Unknown';

  return (
    <div className="min-h-screen bg-slate-50 relative font-nunito overflow-x-hidden">
      {/* Tokopedia style top banner/accent */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-emerald-500 to-emerald-600/0 opacity-10 pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto p-6 lg:p-10">
        {/* Top Navigation Bar - Merchant Style */}
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between mb-10 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-6">
            <button 
              onClick={onBack}
              className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all group"
            >
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <ShoppingBag className="text-emerald-500" size={32} />
                Kantin Sehat <span className="text-emerald-500 font-medium">Merchant</span>
              </h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Terminal Penukaran Koin SD Negeri Tempurejo 1</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-[400px]">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Cari siswa (Nama/Absen)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-14 bg-slate-50 rounded-2xl pl-16 pr-6 border-2 border-transparent focus:border-emerald-400 focus:bg-white focus:outline-none transition-all font-bold text-slate-700"
              />
              {/* Search Results Dropdown */}
              <AnimatePresence>
                {query && results.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 w-full mt-3 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[100] max-h-[400px] overflow-y-auto custom-scrollbar"
                  >
                    {results.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSelectedStudent(s);
                          setQuery('');
                        }}
                        className="w-full p-4 flex items-center justify-between hover:bg-emerald-50 transition-colors border-b border-slate-50 last:border-0 text-left group"
                      >
                        <div className="flex items-center gap-4">
                          <img src={s.photo_url} className="w-10 h-10 rounded-full bg-slate-100" alt="" />
                          <div>
                            <p className="font-black text-slate-800 text-sm group-hover:text-emerald-600 transition-colors">{s.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Kelas {s.class} • Absen {s.absen}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-500 font-black">
                          <span className="text-sm">{s.coins}</span>
                          <Coins size={14} />
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button 
              onClick={() => setShowAddItemModal(true)}
              className="h-14 px-6 rounded-2xl bg-emerald-500 text-white font-black text-sm flex items-center gap-3 hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all"
            >
              <PackagePlus size={20} />
              <span className="hidden sm:inline">Tambah Barang</span>
            </button>

            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`h-14 px-6 rounded-2xl font-black text-sm flex items-center gap-3 transition-all ${
                showHistory ? 'bg-slate-800 text-white shadow-xl' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <History size={20} />
              <span className="hidden sm:inline">Riwayat</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Main Store View */}
          <div className={`${showHistory ? 'col-span-12 lg:col-span-8' : 'col-span-12'} space-y-8`}>
            
            {/* Selected Student Banner (If any) */}
            <AnimatePresence>
              {selectedStudent && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-emerald-500 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-200 flex flex-col md:flex-row items-center justify-between gap-6 relative">
                    <div className="absolute top-0 right-0 w-32 h-full bg-white/10 skew-x-[-20deg] translate-x-10 pointer-events-none" />
                    <div className="flex items-center gap-6 relative z-10">
                      <div className="w-20 h-20 bg-white rounded-3xl p-1 shadow-2xl">
                        <img src={selectedStudent.photo_url} className="w-full h-full rounded-2xl object-cover" alt="" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-1">Siswa Terpilih</p>
                        <h2 className="text-3xl font-black tracking-tight leading-none">{selectedStudent.name}</h2>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase">Absen {selectedStudent.absen}</span>
                          <div className="flex items-center gap-2 font-black text-xl">
                            <Coins size={20} className="text-amber-300" />
                            {selectedStudent.coins} <span className="text-xs opacity-70">Koin</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedStudent(null)}
                      className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-colors relative z-10"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Product Catalog - THE TOKOPEDIA LOOK */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <Tag className="text-emerald-500" size={24} />
                  Katalog Produk Menarik
                </h2>
                <div className="flex gap-2">
                  {['Semua', 'Alat Tulis', 'Makanan', 'Minuman'].map(cat => (
                    <button key={cat} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${cat === 'Semua' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-white text-slate-400 border border-slate-100 hover:border-emerald-200 hover:text-emerald-500'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                {canteenItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={item.stock > 0 ? { y: -10 } : {}}
                    className={`bg-white rounded-[2rem] overflow-hidden border-2 transition-all group flex flex-col h-full ${
                      item.stock > 0 
                      ? 'border-slate-50 hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-100 cursor-pointer' 
                      : 'border-slate-50 opacity-60 grayscale'
                    }`}
                    onClick={() => handleExchange(item)}
                  >
                    {/* Image Area */}
                    <div className="aspect-square bg-slate-50/50 p-6 relative flex items-center justify-center overflow-hidden">
                      <img 
                        src={item.image || 'https://cdn-icons-png.flaticon.com/512/3067/3067451.png'} 
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                        alt={item.name} 
                      />
                      {item.stock === 0 && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="bg-white/90 text-rose-600 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">Habis</span>
                        </div>
                      )}
                      {/* Price Tag Overlay */}
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-lg border border-white/20 z-20">
                        {item.price}🪙
                      </div>

                      {/* Management Controls Overlay */}
                      <div className="absolute inset-x-0 bottom-0 p-3 bg-white/40 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform flex gap-2 z-20">
                        <button 
                          onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
                          className="flex-1 h-10 bg-white/90 hover:bg-white rounded-xl flex items-center justify-center text-slate-600 hover:text-emerald-600 shadow-sm transition-all"
                          title="Edit Barang"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteItem(item.id, e)}
                          className="flex-1 h-10 bg-white/90 hover:bg-rose-50 rounded-xl flex items-center justify-center text-slate-600 hover:text-rose-600 shadow-sm transition-all"
                          title="Hapus Barang"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-5 flex flex-col flex-1">
                      <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">{item.category}</p>
                      <h4 className="text-xs font-black text-slate-700 leading-tight mb-3 line-clamp-2 h-8 group-hover:text-emerald-600 transition-colors">{item.name}</h4>
                      
                      <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className={`text-[9px] font-black uppercase ${item.stock > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                            {item.stock > 0 ? 'Ready Stock' : 'Kosong'}
                          </span>
                          <span className="text-[9px] font-bold text-slate-300">Sisa {item.stock}</span>
                        </div>
                        {item.stock > 0 && (
                          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-100 group-hover:scale-110 transition-transform">
                            <ChevronRight size={16} />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar - History Panel */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="col-span-12 lg:col-span-4"
              >
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 sticky top-10">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                      <History className="text-indigo-500" /> Transaksi Terbaru
                    </h2>
                    <button onClick={() => setShowHistory(false)} className="text-slate-300 hover:text-slate-600"><X size={20} /></button>
                  </div>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {transactionLogs.filter(l => l.amount < 0).slice(0, 15).map((log, i) => {
                      const student = students.find(s => s.id === log.student_id);
                      return (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          key={log.id}
                          className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-emerald-50 hover:border-emerald-100 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-2xl group-hover:scale-110 transition-transform">
                              {log.description.includes('Pensil') ? '✏️' : 
                               log.description.includes('Susu') ? '🥛' : 
                               log.description.includes('Snack') ? '🍪' : '🎁'}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-700">{student?.name || 'Siswa'}</p>
                              <p className="text-[10px] font-bold text-slate-400 line-clamp-1">{log.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-emerald-600">{log.amount}</p>
                            <p className="text-[8px] font-black text-slate-300 uppercase">
                              {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                    {transactionLogs.filter(l => l.amount < 0).length === 0 && (
                      <div className="text-center py-20 text-slate-300 italic font-bold">Belum ada transaksi</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddItemModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddItemModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[3rem] p-10 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-800">
                  {editingItem ? 'Edit Produk' : 'Tambah Produk Baru'}
                </h3>
                <button onClick={() => { setShowAddItemModal(false); resetForm(); }} className="text-slate-300 hover:text-slate-600 transition-colors"><X /></button>
              </div>

              <form onSubmit={handleAddItem} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nama Barang</label>
                    <input 
                      type="text" 
                      required
                      value={newItem.name}
                      onChange={e => setNewItem({...newItem, name: e.target.value})}
                      placeholder="Contoh: Pensil Berwarna"
                      className="w-full h-14 bg-slate-50 rounded-2xl px-6 border-2 border-transparent focus:border-emerald-400 focus:bg-white focus:outline-none transition-all font-bold" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Kategori</label>
                    <select 
                      value={newItem.category}
                      onChange={e => setNewItem({...newItem, category: e.target.value})}
                      className="w-full h-14 bg-slate-50 rounded-2xl px-6 border-2 border-transparent focus:border-emerald-400 focus:bg-white focus:outline-none transition-all font-bold"
                    >
                      <option>Alat Tulis</option>
                      <option>Makanan</option>
                      <option>Minuman</option>
                      <option>Buku</option>
                      <option>Lainnya</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Koin (Harga)</label>
                    <input 
                      type="number" 
                      required
                      value={newItem.price}
                      onChange={e => setNewItem({...newItem, price: parseInt(e.target.value) || 0})}
                      className="w-full h-14 bg-slate-50 rounded-2xl px-6 border-2 border-transparent focus:border-emerald-400 focus:bg-white focus:outline-none transition-all font-bold" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Stok Awal</label>
                    <input 
                      type="number" 
                      required
                      value={newItem.stock}
                      onChange={e => setNewItem({...newItem, stock: parseInt(e.target.value) || 0})}
                      className="w-full h-14 bg-slate-50 rounded-2xl px-6 border-2 border-transparent focus:border-emerald-400 focus:bg-white focus:outline-none transition-all font-bold" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">URL Foto Barang</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="url" 
                        value={newItem.image}
                        onChange={e => setNewItem({...newItem, image: e.target.value})}
                        placeholder="https://..."
                        className="w-full h-14 bg-slate-50 rounded-2xl pl-12 pr-6 border-2 border-transparent focus:border-emerald-400 focus:bg-white focus:outline-none transition-all font-bold" 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => { setShowAddItemModal(false); resetForm(); }}
                    className="flex-1 h-14 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-[2] h-14 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 ${
                      editingItem ? 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-100' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100'
                    }`}
                  >
                    {isSubmitting ? 'Menyimpan...' : (
                      editingItem ? <><Edit2 size={20} /> Simpan Perubahan</> : <><Plus size={20} /> Simpan Barang</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
