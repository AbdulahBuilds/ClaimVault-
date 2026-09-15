import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Sparkles, Heart, ExternalLink, Code2 } from 'lucide-react';
import { THEME } from '../../constants/theme';
import { ClaimVaultLogo } from '../ui/ClaimVaultLogo';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-float border border-brand-border flex flex-col text-center"
        >
          {/* Close button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-brand-navy flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Logo & Brand */}
          <div className="flex flex-col items-center -mt-2 mb-4">
            <ClaimVaultLogo size="lg" className="mb-2" />

            <h3 className="text-lg font-extrabold text-brand-navy tracking-tight">
              {THEME.app.name}
            </h3>
            <span className="text-[11px] font-bold text-brand-teal px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 mt-1">
              Version 1.0.0
            </span>
          </div>

          {/* Value Prop */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 mb-4 text-xs text-brand-navy font-semibold leading-relaxed">
            <span className="text-brand-teal font-extrabold block text-sm mb-1">
              "{THEME.app.tagline}"
            </span>
            <span>
              The personal purchase vault that secures your receipts, return deadlines, and warranty rights in one unified place.
            </span>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-2 mb-5 text-left text-xs text-brand-navy">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-100 shadow-sm">
              <div className="w-6 h-6 rounded-lg bg-teal-50 text-brand-teal flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-[11px]">Dynamic Urgency & Countdown Engine</span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-100 shadow-sm">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-brand-green flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-[11px]">Local Encrypted Digital Receipt Storage</span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-100 shadow-sm">
              <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Code2 className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-[11px]">React Native & TypeScript Architecture</span>
            </div>
          </div>

          <p className="text-[10px] text-brand-muted mb-4">
            Designed and engineered with strict fintech security standards.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-slate-800 transition active:scale-95 shadow-sm"
          >
            Close
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
