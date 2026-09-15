import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, ArrowLeft, Loader2, X } from 'lucide-react';
import { googleAuthService, GoogleUserProfile } from '../../services/googleAuthService';

export interface GoogleAccount {
  name: string;
  email: string;
  avatarUrl: string;
}

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
  const [accounts, setAccounts] = useState<GoogleUserProfile[]>([]);
  const [isUsingAnother, setIsUsingAnother] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [selectingEmail, setSelectingEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAccounts(googleAuthService.getSavedAccounts());
      setIsUsingAnother(false);
      setCustomEmail('');
      setCustomName('');
      setSelectingEmail(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePickAccount = async (account: GoogleUserProfile) => {
    setSelectingEmail(account.email);
    try {
      googleAuthService.saveAccount(account);
      await onSelectAccount({
        name: account.name,
        email: account.email,
        avatarUrl: account.avatarUrl || googleAuthService.getAvatarForName(account.name, account.email),
      });
      onClose();
    } catch {
      setError('Could not sign in with this account. Please try again.');
    } finally {
      setSelectingEmail(null);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) {
      setError('Enter an email address');
      return;
    }

    const email = customEmail.trim().toLowerCase();
    const finalEmail = email.includes('@') ? email : `${email}@gmail.com`;
    const derivedName = customName.trim() || finalEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ') || 'Google User';
    const capitalizedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);

    const newAccount: GoogleUserProfile = {
      name: capitalizedName,
      email: finalEmail,
      avatarUrl: googleAuthService.getAvatarForName(capitalizedName, finalEmail),
    };

    setSelectingEmail(finalEmail);
    try {
      googleAuthService.saveAccount(newAccount);
      await onSelectAccount(newAccount);
      onClose();
    } catch {
      setError('Could not sign in. Please try again.');
    } finally {
      setSelectingEmail(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col font-sans"
          style={{ fontFamily: 'Roboto, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
        >
          {/* Top Bar with Close */}
          <div className="px-6 pt-5 pb-2 flex items-center justify-between">
            {isUsingAnother ? (
              <button
                type="button"
                onClick={() => {
                  setIsUsingAnother(false);
                  setError(null);
                }}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All accounts</span>
              </button>
            ) : (
              <div className="w-5" />
            )}

            {/* Google G Brand Logo */}
            <div className="flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
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

            <button
              type="button"
              onClick={onClose}
              disabled={!!selectingEmail}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Heading */}
          <div className="px-7 pt-1 pb-4 text-center">
            <h2 className="text-xl font-medium text-slate-900 tracking-tight">
              {isUsingAnother ? 'Sign in with Google' : 'Choose an account'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              to continue to <span className="font-semibold text-slate-700">ClaimVault</span>
            </p>
          </div>

          {error && (
            <div className="mx-6 mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
              {error}
            </div>
          )}

          {/* Content Area */}
          {!isUsingAnother ? (
            <div className="flex-1 px-4 divide-y divide-slate-100 max-h-[320px] overflow-y-auto">
              {/* Account list */}
              {accounts.map((account) => {
                const isSelected = selectingEmail === account.email;
                return (
                  <button
                    key={account.email}
                    type="button"
                    disabled={!!selectingEmail}
                    onClick={() => handlePickAccount(account)}
                    className="w-full flex items-center gap-3.5 p-3.5 text-left rounded-2xl hover:bg-slate-100/80 active:bg-slate-200/70 transition group disabled:opacity-60"
                  >
                    {/* Avatar */}
                    <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center">
                      {account.avatarUrl ? (
                        <img
                          src={account.avatarUrl}
                          alt={account.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-sm font-bold text-blue-600">
                          {account.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600 transition">
                        {account.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {account.email}
                      </div>
                    </div>

                    {isSelected && (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                    )}
                  </button>
                );
              })}

              {/* Use Another Account Button */}
              <button
                type="button"
                disabled={!!selectingEmail}
                onClick={() => {
                  setIsUsingAnother(true);
                  setError(null);
                }}
                className="w-full flex items-center gap-3.5 p-3.5 text-left rounded-2xl hover:bg-slate-100/80 active:bg-slate-200/70 transition group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 group-hover:border-blue-300 transition">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div className="text-sm font-medium text-slate-800 group-hover:text-blue-600 transition">
                  Use another account
                </div>
              </button>
            </div>
          ) : (
            /* Inline Form to Use Another Google Account */
            <form onSubmit={handleCustomSubmit} className="px-6 py-2 space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-slate-700">Email or phone</label>
                <input
                  type="email"
                  autoFocus
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-slate-700">Name (optional)</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Abdullah Khan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setIsUsingAnother(false)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 py-2 px-1 hover:underline"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={!!selectingEmail}
                  className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5 disabled:opacity-60"
                >
                  {selectingEmail ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Next</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Google Footer Disclaimer */}
          <div className="px-6 py-4 mt-2 border-t border-slate-100 bg-slate-50/70 text-[11px] text-slate-500 leading-relaxed text-left">
            <p>
              To continue, Google will share your name, email address, language preference, and profile picture with ClaimVault. Before using ClaimVault, you can review its{' '}
              <span className="text-blue-600 hover:underline cursor-pointer">Privacy Policy</span> and{' '}
              <span className="text-blue-600 hover:underline cursor-pointer">Terms of Service</span>.
            </p>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-3">
              <span>English (United States)</span>
              <div className="flex gap-3">
                <span className="hover:text-slate-600 cursor-pointer">Help</span>
                <span className="hover:text-slate-600 cursor-pointer">Privacy</span>
                <span className="hover:text-slate-600 cursor-pointer">Terms</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
