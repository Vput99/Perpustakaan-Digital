import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useSmartSchool } from '../context/SmartSchoolContext';

const GlobalToast: React.FC = () => {
  const { toasts } = useSmartSchool();

  return (
    <div className="fixed top-8 right-8 z-[1000] flex flex-col gap-4 w-full max-w-[400px] pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="pointer-events-auto"
          >
            <div className={`relative overflow-hidden group backdrop-blur-2xl rounded-[1.5rem] p-1 border shadow-2xl ${
              toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10' :
              toast.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 shadow-rose-500/10' :
              'bg-blue-500/10 border-blue-500/20 shadow-blue-500/10'
            }`}>
              {/* Background Accent Gradients */}
              <div className={`absolute top-0 right-0 w-32 h-32 blur-[40px] opacity-20 -mr-10 -mt-10 rounded-full ${
                toast.type === 'success' ? 'bg-emerald-500' :
                toast.type === 'error' ? 'bg-rose-500' :
                'bg-blue-500'
              }`} />
              
              <div className="relative flex items-center gap-5 p-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-500 ${
                  toast.type === 'success' ? 'bg-emerald-500 text-white shadow-emerald-200' :
                  toast.type === 'error' ? 'bg-rose-500 text-white shadow-rose-200' :
                  'bg-blue-500 text-white shadow-blue-200'
                }`}>
                  {toast.type === 'success' && <CheckCircle size={28} strokeWidth={2.5} />}
                  {toast.type === 'error' && <XCircle size={28} strokeWidth={2.5} />}
                  {toast.type === 'info' && <Info size={28} strokeWidth={2.5} />}
                </div>

                <div className="flex-1 pr-6">
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 opacity-50 ${
                    toast.type === 'success' ? 'text-emerald-600' :
                    toast.type === 'error' ? 'text-rose-600' :
                    'text-blue-600'
                  }`}>
                    {toast.type === 'success' ? 'Berhasil' : toast.type === 'error' ? 'Kesalahan' : 'Informasi'}
                  </p>
                  <p className="text-sm font-black text-slate-800 leading-tight">
                    {toast.message}
                  </p>
                </div>

                {/* Progress Bar */}
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 4, ease: "linear" }}
                  className={`absolute bottom-0 left-0 h-1 rounded-full ${
                    toast.type === 'success' ? 'bg-emerald-500' :
                    toast.type === 'error' ? 'bg-rose-500' :
                    'bg-blue-500'
                  }`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default GlobalToast;
