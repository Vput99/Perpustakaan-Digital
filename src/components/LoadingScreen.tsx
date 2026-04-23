import { useRive, useStateMachineInput, Layout, Fit, Alignment } from '@rive-app/react-canvas';
import { motion } from 'motion/react';

export default function LoadingScreen() {
  const { rive, RiveComponent } = useRive({
    src: '/assets/loading.riv',
    stateMachines: "State Machine 1",
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  });

  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-transparent"
    >
      <div className="w-full max-w-2xl aspect-video mix-blend-multiply">
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
