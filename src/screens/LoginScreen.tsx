import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { InputField } from '../components/ui/InputField';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { THEME } from '../constants/theme';
import { useToast } from '../context/ToastContext';
import { googleAuthService } from '../services/googleAuthService';
import { ClaimVaultLogo } from '../components/ui/ClaimVaultLogo';

interface LoginScreenProps {
  onGoToSignup: () => void;
  onGoToForgotPassword: () => void;
  onLoginSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onGoToSignup,
  onGoToForgotPassword,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login, loginWithGoogle } = useAuth();
  const { showToast } = useToast();

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email address';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(email, password);
      const name = email.split('@')[0];
      const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
      showToast(`Welcome back, ${capitalized}!`, 'success');
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch {
      showToast('Failed to sign in', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await login('demo@claimvault.com', 'password123');
      showToast('Signed in with Demo Account', 'success');
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch {
      showToast('Demo sign in failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const googleUser = await googleAuthService.signInWithGoogle();
      await loginWithGoogle(googleUser);
      showToast(`Signed in as ${googleUser.name} with Google`, 'success');
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('closed') && !err.message.includes('cancelled')) {
        showToast(err.message || 'Google Sign-In failed', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col justify-between p-6 bg-white overflow-y-auto">
      <div className="space-y-6 pt-2">
        {/* Brand Header */}
        <div className="space-y-3 text-center flex flex-col items-center">
          <ClaimVaultLogo size="lg" className="mx-auto" />
          <div>
            <h1 className="text-2xl font-extrabold text-brand-navy tracking-tight">
              Welcome to {THEME.app.name}
            </h1>
            <p className="text-xs font-medium text-brand-muted mt-1">
              Sign in to access your purchases and warranties
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 pt-1">
          <InputField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            error={errors.email}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <div>
            <InputField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              error={errors.password}
              leftIcon={<Lock className="w-4 h-4" />}
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

            <div className="flex justify-end mt-1.5">
              <button
                type="button"
                onClick={onGoToForgotPassword}
                className="text-xs font-semibold text-brand-teal hover:underline"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            className="mt-2"
          >
            Login
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-brand-border w-full" />
          <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-brand-muted shrink-0">
            or continue with
          </span>
        </div>

        {/* Social Login & Demo Login */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-brand-border hover:bg-slate-50 transition active:scale-[0.98] text-xs font-bold text-brand-navy"
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
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-50 hover:bg-teal-100/70 border border-teal-200/80 transition active:scale-[0.98] text-xs font-bold text-brand-teal"
          >
            <span>⚡ Quick Demo Login (1-Tap)</span>
          </button>
        </div>
      </div>

      {/* Footer Switch */}
      <div className="text-center py-3 border-t border-slate-100 mt-4">
        <p className="text-xs text-brand-muted">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onGoToSignup}
            className="text-brand-teal font-bold hover:underline"
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
};
