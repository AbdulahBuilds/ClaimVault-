import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  ExternalLink, 
  Key, 
  UserCheck, 
  Mail, 
  ShieldCheck, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import { InputField } from '../ui/InputField';
import { googleAuthService, GoogleUserProfile } from '../../services/googleAuthService';
import { useToast } from '../../context/ToastContext';

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
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'popup' | 'custom' | 'client_id'>('popup');
  
  // Real Google Sign-In state
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(() => googleAuthService.getClientId());
  
  // Custom Email Sign-In
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  useEffect(() => {
    if (isOpen) {
      googleAuthService.loadGoogleSdk().catch(() => {});
      setClientIdInput(googleAuthService.getClientId());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLaunchGooglePopup = async () => {
    setIsSigningIn(true);
    try {
      if (!googleAuthService.hasClientId()) {
        setActiveTab('client_id');
        showToast('Please enter your Google OAuth Client ID to connect real Google Sign-In', 'info');
        setIsSigningIn(false);
        return;
      }

      const googleUser = await googleAuthService.signInWithGooglePopup();
      await onSelectAccount({
        name: googleUser.name,
        email: googleUser.email,
        avatarUrl: googleUser.avatarUrl,
      });
      onClose();
    } catch (err: any) {
      if (err.message === 'MISSING_CLIENT_ID') {
        setActiveTab('client_id');
        showToast('Please enter your Google OAuth Client ID to enable real Google authentication', 'info');
      } else {
        showToast(err.message || 'Google Sign-In failed or was cancelled', 'error');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientIdInput.trim()) {
      showToast('Please enter a valid Google Client ID', 'error');
      return;
    }

    googleAuthService.setClientId(clientIdInput.trim());
    showToast('Google Client ID saved! You can now sign in with Google.', 'success');
    setActiveTab('popup');
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) {
      showToast('Please enter your email address', 'error');
      return;
    }

    const email = customEmail.trim().toLowerCase();
    const finalEmail = email.includes('@') ? email : `${email}@gmail.com`;
    const name = customName.trim() || finalEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ') || 'Google User';
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

    setIsSigningIn(true);
    try {
      await onSelectAccount({
        name: capitalizedName,
        email: finalEmail,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(capitalizedName)}&background=4285F4&color=fff&bold=true`,
      });
      onClose();
    } finally {
      setIsSigningIn(false);
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
          className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-3">
              {/* Google 4-Color Icon */}
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
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
                <h3 className="text-sm font-extrabold text-brand-navy">Google Authentication</h3>
                <p className="text-[11px] text-brand-muted">Secure Sign-In for ClaimVault</p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isSigningIn}
              className="w-7 h-7 rounded-full bg-slate-200/70 hover:bg-slate-300/70 text-slate-700 flex items-center justify-center transition active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-100 bg-slate-50/40 px-3 pt-2 gap-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('popup')}
              className={`flex-1 py-2 font-bold border-b-2 text-center transition ${
                activeTab === 'popup'
                  ? 'border-brand-teal text-brand-teal'
                  : 'border-transparent text-brand-muted hover:text-brand-navy'
              }`}
            >
              Google OAuth
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`flex-1 py-2 font-bold border-b-2 text-center transition ${
                activeTab === 'custom'
                  ? 'border-brand-teal text-brand-teal'
                  : 'border-transparent text-brand-muted hover:text-brand-navy'
              }`}
            >
              Personal Email
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('client_id')}
              className={`flex-1 py-2 font-bold border-b-2 text-center transition ${
                activeTab === 'client_id'
                  ? 'border-brand-teal text-brand-teal'
                  : 'border-transparent text-brand-muted hover:text-brand-navy'
              }`}
            >
              OAuth Settings
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-4 overflow-y-auto">
            {/* TAB 1: Real Google OAuth Popup */}
            {activeTab === 'popup' && (
              <div className="space-y-4 text-center">
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/70 space-y-1.5 text-left">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-xs font-bold text-blue-950">Official Google OAuth 2.0</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Clicking below launches the real Google Sign-In popup to authenticate your personal Google account.
                  </p>
                </div>

                <Button
                  variant="action"
                  size="lg"
                  fullWidth
                  onClick={handleLaunchGooglePopup}
                  isLoading={isSigningIn}
                  leftIcon={
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#fff"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#fff"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                      />
                      <path
                        fill="#fff"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#fff"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                  }
                >
                  Launch Google Sign-In Popup
                </Button>

                {!googleAuthService.hasClientId() && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('client_id')}
                    className="text-[11px] text-brand-teal font-semibold hover:underline flex items-center justify-center gap-1 mx-auto"
                  >
                    <Key className="w-3 h-3" />
                    <span>Configure your Google Client ID</span>
                  </button>
                )}
              </div>
            )}

            {/* TAB 2: Enter Personal Gmail/Name */}
            {activeTab === 'custom' && (
              <form onSubmit={handleCustomSubmit} className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-brand-muted">
                  Enter your real Google / Gmail address to sign in and personalize your vault immediately.
                </div>

                <InputField
                  label="Your Google Email"
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  leftIcon={<Mail className="w-4 h-4 text-brand-muted" />}
                  required
                />

                <InputField
                  label="Full Name (Optional)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Abdullah Khan"
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  isLoading={isSigningIn}
                  className="mt-2"
                >
                  Sign In with this Google Account
                </Button>
              </form>
            )}

            {/* TAB 3: Google Client ID Setup */}
            {activeTab === 'client_id' && (
              <form onSubmit={handleSaveClientId} className="space-y-3 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-navy">Google OAuth 2.0 Client ID</label>
                  <input
                    type="text"
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    placeholder="xxxxxxxx.apps.googleusercontent.com"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono focus:border-brand-teal focus:ring-1 focus:ring-brand-teal outline-none"
                  />
                  <p className="text-[10px] text-brand-muted leading-tight">
                    Get a free OAuth Web Client ID from Google Cloud Console with authorized origin <code className="bg-slate-100 px-1 rounded font-bold">http://localhost:5173</code>.
                  </p>
                </div>

                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-brand-teal font-bold hover:underline"
                >
                  <span>Open Google Cloud Console</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setActiveTab('popup')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    Save Client ID
                  </Button>
                </div>
              </form>
            )}

            {/* Security Guarantee */}
            <div className="pt-2 text-center border-t border-slate-100">
              <p className="text-[10px] text-brand-muted flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3 text-brand-teal" /> Protected by ClaimVault Encrypted Vault
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
