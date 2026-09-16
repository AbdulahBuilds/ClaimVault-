import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Clock, Receipt, BellRing, Sparkles, CheckCircle2 } from 'lucide-react';
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
          className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-float border border-brand-border flex flex-col max-h-[85vh] overflow-y-auto no-scrollbar"
        >
          {/* Close button */}
          <div className="flex justify-end -mt-1 -mr-1 mb-1">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-brand-navy flex items-center justify-center transition active:scale-95"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Logo & Brand Header */}
          <div className="flex flex-col items-center mb-4">
            <ClaimVaultLogo size="lg" className="mb-2.5" />

            <h3 className="text-xl font-extrabold text-brand-navy tracking-tight">
              {THEME.app.name}
            </h3>
            <p className="text-xs font-bold text-brand-teal mt-0.5">
              Personal Purchase & Warranty Vault
            </p>
          </div>

          {/* Mission & Purpose */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 mb-4 text-left">
            <p className="text-xs font-bold text-brand-navy mb-1">
              Never Miss a Deadline or Claim
            </p>
            <p className="text-[11px] text-brand-muted leading-relaxed">
              ClaimVault helps you safeguard your purchases by storing digital receipts, tracking return periods with live countdowns, and delivering timely reminders before warranty coverage expires.
            </p>
          </div>

          {/* Core Product Capabilities */}
          <div className="space-y-2.5 mb-5 text-left">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
              Key Vault Features
            </h4>

            {/* Feature 1 */}
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-brand-teal flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-brand-navy">Return & Warranty Countdowns</p>
                <p className="text-[11px] text-brand-muted leading-tight mt-0.5">
                  Live urgency indicators showing exact days remaining for returns and repairs.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Receipt className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-brand-navy">Digital Receipt Storage</p>
                <p className="text-[11px] text-brand-muted leading-tight mt-0.5">
                  Keep high-resolution photos of invoices and receipts ready for warranty claims.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <BellRing className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-brand-navy">Proactive Device Alerts</p>
                <p className="text-[11px] text-brand-muted leading-tight mt-0.5">
                  Automated reminders delivered before your return windows close.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-brand-navy">Private Vault Protection</p>
                <p className="text-[11px] text-brand-muted leading-tight mt-0.5">
                  Your purchase records remain secure, encrypted, and in your full control.
                </p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-brand-navy text-white text-xs font-bold hover:bg-slate-800 transition active:scale-98 shadow-sm"
          >
            Back to Profile
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
