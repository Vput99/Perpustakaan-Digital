import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { useSmartSchool } from '../context/SmartSchoolContext';

const GlobalConfirm: React.FC = () => {
  const { confirmConfig, setConfirmConfig } = useSmartSchool();

  if (!confirmConfig) return null;

  const handleAction = (choice: boolean) => {
    confirmConfig.resolve(choice);
    setConfirmConfig(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => handleAction(false)}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl overflow-hidden"
        >
          {/* Decorative Gradient Background */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 blur-[60px] rounded-full -mr-20 -mt-20" />
          
          <div className="relative text-center">
            {/* Icon Container */}
            <div className="w-20 h-20 bg-amber-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-amber-50" >
              <AlertTriangle size={40} className="text-amber-500" />
            </div>

            <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">
              {confirmConfig.title}
            </h3>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed px-4">
              {confirmConfig.message}
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => handleAction(false)}
                className="flex-1 h-16 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all border-2 border-transparent"
              >
                Batalkan
              </button>
              <button
                onClick={() => handleAction(true)}
                className="flex-[1.5] h-16 bg-amber-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-amber-200 hover:bg-amber-600 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button 
            onClick={() => handleAction(false)}
            className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GlobalConfirm;
