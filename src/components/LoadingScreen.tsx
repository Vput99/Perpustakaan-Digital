import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import { motion } from 'motion/react';

export default function LoadingScreen() {
  const { rive, RiveComponent } = useRive({
    src: 'p/assets/loading.riv',
    autoplay: true,
  });

  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm"
    >
      <div className="w-64 h-64 md:w-96 md:h-96">
        <RiveComponent className="w-full h-full" />
      </div>
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="mt-8 text-2xl font-black text-blue-600 tracking-wider"
      >
        Memuat Koleksi...
      </motion.div>
    </motion.div>
  );
}
