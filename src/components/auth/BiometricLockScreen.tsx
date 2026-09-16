import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Fingerprint, 
  Lock, 
  ShieldCheck, 
  KeyRound, 
  Unlock, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { biometricService } from '../../services/biometricService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface BiometricLockScreenProps {
  onUnlock: () => void;
}

export const BiometricLockScreen: React.FC<BiometricLockScreenProps> = ({ onUnlock }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [pinMode, setPinMode] = useState(false);
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isBiometricSupported, setIsBiometricSupported] = useState(true);

  useEffect(() => {
    let mounted = true;
    biometricService.isBiometricSupported().then((supported) => {
      if (mounted) setIsBiometricSupported(supported);
    });

    // Auto-trigger biometric prompt on mount
    const timer = setTimeout(() => {
      handleBiometricAuth();
    }, 400);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    setErrorMsg(null);

    const result = await biometricService.authenticateBiometrics();
    setIsAuthenticating(false);

    if (result.success) {
      showToast('Vault unlocked successfully', 'success', 1500);
      onUnlock();
    } else {
      // If WebAuthn was cancelled or not supported, offer PIN fallback
      if (result.error && !result.error.includes('cancel')) {
        setErrorMsg(result.error);
      }
    }
  };

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.length < 4) {
      setErrorMsg('Please enter a 4-digit PIN');
      return;
    }

    const isValid = biometricService.verifyPin(pin);
    if (isValid) {
      showToast('Vault unlocked successfully', 'success', 1500);
      onUnlock();
    } else {
      setErrorMsg('Incorrect PIN. (Default PIN: 1234)');
      setPin('');
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg(null);
      if (nextPin.length === 4) {
        // Auto-check 4-digit PIN
        const isValid = biometricService.verifyPin(nextPin);
        if (isValid) {
          showToast('Vault unlocked successfully', 'success', 1500);
          onUnlock();
        } else {
          setErrorMsg('Incorrect PIN. (Default PIN: 1234)');
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'V';

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-between p-6 text-white select-none">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-brand-teal/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="w-full flex items-center justify-between z-10 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">ClaimVault Encrypted</span>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-400 flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-brand-teal" />
          <span>Locked</span>
        </div>
      </div>

      {/* Center Biometric Sensor / Keypad */}
      <div className="w-full max-w-xs flex flex-col items-center justify-center text-center z-10 space-y-6 my-auto">
        {/* User Badge */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-navy via-slate-800 to-brand-teal text-white flex items-center justify-center text-xl font-black shadow-xl border border-white/20">
            {userInitial}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-brand-teal">
            <Lock className="w-3 h-3" />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {user?.name || 'Vault Owner'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {pinMode ? 'Enter your 4-digit Security PIN' : 'Touch sensor or use Face ID to unlock'}
          </p>
        </div>

        {/* Dynamic Mode: Biometrics vs PIN */}
        {!pinMode ? (
          <div className="flex flex-col items-center space-y-5 w-full">
            {/* Pulsing Fingerprint Icon */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBiometricAuth}
              disabled={isAuthenticating}
              className="relative w-24 h-24 rounded-3xl bg-gradient-to-b from-teal-500/20 to-slate-900 border-2 border-brand-teal/50 flex items-center justify-center text-brand-teal shadow-[0_0_30px_rgba(20,184,166,0.25)] hover:border-brand-teal transition-colors"
            >
              <AnimatePresence>
                {isAuthenticating ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    className="w-10 h-10 border-2 border-brand-teal border-t-transparent rounded-full"
                  />
                ) : (
                  <Fingerprint className="w-12 h-12 text-teal-400" />
                )}
              </AnimatePresence>
            </motion.button>

            {errorMsg && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/60 border border-rose-800/50 px-3 py-1.5 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="w-full space-y-2 pt-2">
              <button
                type="button"
                onClick={handleBiometricAuth}
                disabled={isAuthenticating}
                className="w-full py-3 rounded-2xl bg-brand-teal text-slate-950 text-xs font-bold hover:bg-teal-400 transition shadow-lg active:scale-98 flex items-center justify-center gap-2"
              >
                <Fingerprint className="w-4 h-4" />
                <span>Unlock with Biometrics</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPinMode(true);
                  setErrorMsg(null);
                }}
                className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>Use Security PIN Fallback</span>
              </button>
            </div>
          </div>
        ) : (
          /* PIN Keypad Screen */
          <div className="w-full flex flex-col items-center space-y-4">
            {/* PIN Dots */}
            <div className="flex gap-3 justify-center my-2">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full transition-all ${
                    pin.length > idx
                      ? 'bg-brand-teal scale-110 shadow-[0_0_8px_rgba(20,184,166,0.8)]'
                      : 'bg-slate-800 border border-slate-700'
                  }`}
                />
              ))}
            </div>

            {errorMsg && (
              <p className="text-[11px] text-rose-400 font-medium">{errorMsg}</p>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2.5 w-full max-w-[240px] pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeypadPress(digit)}
                  className="w-16 h-12 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 text-sm font-bold text-white transition active:scale-95 flex items-center justify-center"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setPinMode(false);
                  setErrorMsg(null);
                }}
                className="w-16 h-12 rounded-xl bg-slate-950 text-[10px] font-semibold text-slate-400 hover:text-white transition flex items-center justify-center"
              >
                Biometrics
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="w-16 h-12 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 text-sm font-bold text-white transition active:scale-95 flex items-center justify-center"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="w-16 h-12 rounded-xl bg-slate-950 text-xs font-semibold text-slate-400 hover:text-rose-400 transition flex items-center justify-center"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Guarantees */}
      <div className="w-full text-center text-[10px] text-slate-500 z-10 pb-2">
        <span>Protected with local AES encryption & hardware enclave</span>
      </div>
    </div>
  );
};
