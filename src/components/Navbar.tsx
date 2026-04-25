/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, Library, User, Coins } from 'lucide-react';
import { motion } from 'motion/react';
import { useSmartSchool } from '../context/SmartSchoolContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onNavigateKantin?: () => void;
}

export default function Navbar({ onNavigateKantin }: NavbarProps) {
  const { profile, loading } = useSmartSchool();
  const navigate = useNavigate();

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className="bg-white rounded-3xl shadow-sm border-2 border-slate-100 flex items-center justify-between px-6 py-4 md:px-8 h-20" 
      id="main-nav"
    >
      <div className="flex items-center gap-3">
        <motion.div 
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1] 
          }}
          transition={{ duration: 5, repeat: Infinity }}
          whileHover={{ rotate: 180, scale: 1.2 }}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xl shadow-lg shadow-blue-100 cursor-pointer"
        >
          P
        </motion.div>
        <h1 className="text-xl md:text-2xl font-black text-blue-600 tracking-tight flex items-center gap-2 overflow-hidden">
          <motion.span
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ 
              backgroundImage: "linear-gradient(90deg, #2563eb, #fb923c, #2563eb)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            PerpusKita 
          </motion.span>
          <motion.span
            animate={{ 
              rotate: [0, 14, -8, 14, -4, 10, 0],
              y: [0, -2, 0]
            }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
            className="inline-block origin-bottom-right"
          >
            👋
          </motion.span>
          <motion.span 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="hidden md:inline text-orange-400 text-xs font-medium ml-2 opacity-80"
          >
            SD Negeri Tempurejo 1
          </motion.span>
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Coin Balance Widget */}
        {profile && profile.role === 'siswa' && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNavigateKantin}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-400 px-4 py-2 rounded-full shadow-md shadow-amber-200/50 cursor-pointer border-2 border-amber-300/50 group"
            title="Saldo Koin"
            id="coin-balance-widget"
          >
            <motion.div
              animate={{ 
                rotateY: [0, 360],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Coins size={18} className="text-amber-800 drop-shadow-sm" />
            </motion.div>
            <motion.span
              key={profile.coins}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-sm font-black text-amber-900 tabular-nums"
            >
              {profile.coins}
            </motion.span>
            <span className="hidden sm:inline text-[10px] font-bold text-amber-700/70 uppercase tracking-wide">
              Koin
            </span>
          </motion.button>
        )}

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="hidden lg:flex bg-slate-100 px-4 py-2 rounded-full items-center gap-2 ring-1 ring-slate-200 focus-within:ring-blue-400 focus-within:bg-white transition-all shadow-inner relative overflow-hidden"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 15, -15, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Search size={18} className="text-slate-400" />
          </motion.div>
          <input
            type="text"
            placeholder="Cari buku favoritmu..."
            className="bg-transparent border-none focus:outline-none text-sm w-48 xl:w-64 font-medium text-slate-600 z-10"
          />
          <motion.div 
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"
          />
        </motion.div>
        
        <motion.button 
          whileHover={{ scale: 1.2, rotate: 360 }}
          whileTap={{ scale: 0.8 }}
          className="lg:hidden w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:text-blue-600 transition-colors shadow-sm"
        >
          <Search size={20} />
        </motion.button>
        
        <motion.button 
          whileHover={{ 
            scale: 1.15, 
            rotate: [0, -10, 10, -10, 0],
            boxShadow: "0 10px 15px -3px rgba(251, 146, 60, 0.4)"
          }}
          whileTap={{ scale: 0.9 }}
          animate={{
            y: [0, -3, 0]
          }}
          transition={{
            y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          onClick={() => {
            if (profile) {
              const role = profile.role;
              if (role === 'siswa') navigate('/student');
              else if (role === 'kantin') navigate('/kantin');
              else if (role === 'admin') navigate('/admin');
            } else {
              navigate('/login');
            }
          }}
          className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 hover:bg-orange-200 transition-colors shadow-md border-2 border-orange-200"
        >
          <User size={20} />
        </motion.button>
      </div>
    </motion.nav>
  );
}
