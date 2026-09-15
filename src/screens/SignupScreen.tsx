import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { InputField } from '../components/ui/InputField';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { THEME } from '../constants/theme';
import { useToast } from '../context/ToastContext';
import { GoogleAuthModal, GoogleAccount } from '../components/modals/GoogleAuthModal';
import { ClaimVaultLogo } from '../components/ui/ClaimVaultLogo';

interface SignupScreenProps {
  onGoToLogin: () => void;
  onSignupSuccess?: () => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ onGoToLogin, onSignupSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const { signup, loginWithGoogle } = useAuth();
  const { showToast } = useToast();

  const handleSelectGoogleAccount = async (account: GoogleAccount) => {
    setIsLoading(true);
    try {
      await loginWithGoogle(account);
      showToast(`Welcome to ${THEME.app.name}, ${account.name}!`, 'success');
      if (onSignupSuccess) {
        onSignupSuccess();
      }
    } catch {
      showToast('Google sign up failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const validate = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email) newErrors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email address';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await signup(name, email, password);
      showToast(`Welcome to ${THEME.app.name}, ${name}!`, 'success');
      if (onSignupSuccess) {
        onSignupSuccess();
      }
    } catch {
      showToast('Registration failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col justify-between p-6 bg-white overflow-y-auto">
      <div className="space-y-4 pt-2">
        <button
          type="button"
          onClick={onGoToLogin}
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-muted hover:text-brand-navy"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </button>

        <div className="flex flex-col items-center text-center space-y-2 pt-1">
          <ClaimVaultLogo size="md" />
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-brand-navy tracking-tight">
              Create Account
            </h1>
            <p className="text-xs font-medium text-brand-muted">
              Start protecting your purchases, receipts & warranties
            </p>
          </div>
        </div>

        {/* Continue with Google Button on Signup */}
        <button
          type="button"
          onClick={() => setIsGoogleModalOpen(true)}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-brand-border hover:bg-slate-50 transition active:scale-[0.98] text-xs font-bold text-brand-navy shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          <span>Sign up with Google</span>
        </button>

        <div className="relative flex items-center justify-center my-1">
          <div className="border-t border-brand-border w-full" />
          <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-brand-muted shrink-0">
            or register with email
          </span>
          <div className="border-t border-brand-border w-full" />
        </div>

        <form onSubmit={handleSignup} className="space-y-3 pt-1">
          <InputField
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Abdullah Khan"
            error={errors.name}
            leftIcon={<User className="w-4 h-4 text-brand-muted" />}
            required
          />

          <InputField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            error={errors.email}
            leftIcon={<Mail className="w-4 h-4 text-brand-muted" />}
            required
          />

          <InputField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            error={errors.password}
            leftIcon={<Lock className="w-4 h-4 text-brand-muted" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-brand-muted hover:text-brand-navy p-1 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            required
          />

          <InputField
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your password"
            error={errors.confirmPassword}
            leftIcon={<Lock className="w-4 h-4 text-brand-muted" />}
            required
          />

          <div className="text-[11px] text-brand-muted leading-snug pt-1">
            By creating an account, you agree to our{' '}
            <span className="text-brand-teal font-semibold">Terms of Service</span> and{' '}
            <span className="text-brand-teal font-semibold">Privacy Policy</span>.
          </div>

          <Button
            type="submit"
            variant="action"
            size="lg"
            fullWidth
            isLoading={isLoading}
            className="mt-2"
          >
            Create Account
          </Button>
        </form>
      </div>

      <div className="text-center py-3 border-t border-slate-100 mt-4">
        <p className="text-xs text-brand-muted">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onGoToLogin}
            className="text-brand-teal font-bold hover:underline"
          >
            Log in
          </button>
        </p>
      </div>

      {/* In-App Google Account Chooser Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelectAccount={handleSelectGoogleAccount}
      />
    </div>
  );
};
