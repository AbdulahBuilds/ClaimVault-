import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClaimVaultLogo } from './ClaimVaultLogo';
import { ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 700);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed inset-0 z-[250] bg-brand-navy flex flex-col items-center justify-between p-8 text-white select-none"
    >
      {/* Background radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-brand-teal/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full" />

      {/* Center Brand Identity */}
      <div className="flex flex-col items-center text-center space-y-5 z-10">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="relative"
        >
          <ClaimVaultLogo size="xl" className="shadow-2xl" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="space-y-1.5"
        >
          <h1 className="text-2xl font-black tracking-tight text-white">
            ClaimVault
          </h1>
          <p className="text-xs font-semibold text-brand-teal-light tracking-wide">
            Never lose track of what you bought.
          </p>
        </motion.div>
      </div>

      {/* Bottom Loading Progress */}
      <div className="w-full max-w-[160px] flex flex-col items-center space-y-2 z-10 pb-4">
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.65, ease: 'easeInOut' }}
            className="h-full bg-gradient-to-r from-brand-teal to-teal-300 rounded-full"
          />
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
          <ShieldCheck className="w-3 h-3 text-brand-teal" />
          <span>Securing Vault</span>
        </div>
      </div>
    </motion.div>
  );
};
