import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Check, ArrowRight, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { InputField } from '../ui/InputField';

export interface GoogleAccount {
  name: string;
  email: string;
  avatarUrl: string;
}

const DEFAULT_GOOGLE_ACCOUNTS: GoogleAccount[] = [
  {
    name: 'Abdullah Khan',
    email: 'abdullah.khan@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Syed Ali',
    email: 'syed.ali.pk@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
];

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: GoogleAccount) => Promise<void>;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
}) => {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleAccountClick = async (account: GoogleAccount) => {
    setSelectedEmail(account.email);
    setIsProcessing(true);
    try {
      await onSelectAccount(account);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;

    const email = customEmail.trim().toLowerCase();
    const finalEmail = email.includes('@') ? email : `${email}@gmail.com`;
    const name = customName.trim() || finalEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ') || 'Google User';
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

    const newAccount: GoogleAccount = {
      name: capitalizedName,
      email: finalEmail,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(capitalizedName)}&background=4285F4&color=fff&bold=true`,
    };

    setIsProcessing(true);
    try {
      await onSelectAccount(newAccount);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/80 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.96 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-3">
              {/* Google 4-Color Icon */}
              <div className="w-9 h-9 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-brand-navy">Sign in with Google</h3>
                <p className="text-[11px] text-brand-muted">Choose an account for ClaimVault</p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-7 h-7 rounded-full bg-slate-200/70 hover:bg-slate-300/70 text-slate-700 flex items-center justify-center transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Account Selection List */}
          <div className="p-4 space-y-2 overflow-y-auto">
            {!isAddingCustom ? (
              <>
                <div className="space-y-2">
                  {DEFAULT_GOOGLE_ACCOUNTS.map((account) => (
                    <button
                      key={account.email}
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleAccountClick(account)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition active:scale-[0.98] group ${
                        selectedEmail === account.email
                          ? 'border-brand-teal bg-teal-50/70'
                          : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={account.avatarUrl}
                          alt={account.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-brand-navy truncate">
                            {account.name}
                          </h4>
                          <p className="text-[11px] text-brand-muted truncate">
                            {account.email}
                          </p>
                        </div>
                      </div>

                      <div className="text-brand-teal text-xs font-bold shrink-0 opacity-0 group-hover:opacity-100 transition">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Add Custom Google Account Button */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setIsAddingCustom(true)}
                  className="w-full p-3 rounded-2xl border border-dashed border-slate-300 hover:border-brand-teal hover:bg-slate-50 text-left flex items-center gap-3 transition text-brand-navy active:scale-[0.98] mt-2"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-brand-navy flex items-center justify-center shrink-0">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-navy">Use another Google account</h4>
                    <p className="text-[10px] text-brand-muted">Sign in with your personal @gmail address</p>
                  </div>
                </button>
              </>
            ) : (
              /* Custom Account Form */
              <form onSubmit={handleCustomSubmit} className="space-y-3 pt-1">
                <InputField
                  label="Google Email"
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  required
                />
                <InputField
                  label="Your Name (Optional)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Abdullah Khan"
                />

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    className="flex-1 text-xs"
                    onClick={() => setIsAddingCustom(false)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="flex-1 text-xs"
                    isLoading={isProcessing}
                  >
                    Continue
                  </Button>
                </div>
              </form>
            )}

            {/* Privacy note */}
            <div className="pt-3 text-center">
              <p className="text-[10px] text-brand-muted flex items-center justify-center gap-1">
                <Shield className="w-3 h-3 text-brand-teal" /> Protected by ClaimVault Secure Authentication
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
