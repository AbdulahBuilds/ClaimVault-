import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import splashImg from '../../assets/splash-screen.jpg';

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number; // duration in ms, default 2200
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  duration = 2200,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress simulation
    const interval = 30;
    const steps = duration / interval;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, interval);

    const finishTimeout = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(finishTimeout);
    };
  }, [duration, onFinish]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03, filter: 'blur(4px)' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 z-50 flex flex-col justify-between items-center bg-[#071321] overflow-hidden select-none cursor-pointer"
      onClick={onFinish}
    >
      {/* Background Ambience Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#071626]/40 via-transparent to-[#040c17] pointer-events-none z-10" />

      {/* Main Splash Artwork Image */}
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <img
          src={splashImg}
          alt="ClaimVault Splash"
          className="w-full h-full object-cover object-center"
          draggable={false}
        />
      </motion.div>

      {/* Bottom Loading Progress & Microtext */}
      <div className="absolute bottom-8 left-0 right-0 px-8 flex flex-col items-center gap-3 z-20">
        {/* Animated Progress Bar */}
        <div className="w-44 h-1.5 bg-white/10 backdrop-blur-md rounded-full overflow-hidden border border-white/10 p-[1px]">
          <motion.div
            className="h-full bg-gradient-to-r from-teal-400 via-teal-300 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(45,212,191,0.7)]"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-[11px] font-medium tracking-wider text-slate-300 uppercase"
        >
          Securing Your Vault...
        </motion.p>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
