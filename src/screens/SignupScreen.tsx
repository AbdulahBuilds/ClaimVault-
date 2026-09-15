import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, ShieldCheck, KeyRound, RefreshCw } from 'lucide-react';
import { InputField } from '../components/ui/InputField';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { THEME } from '../constants/theme';
import { useToast } from '../context/ToastContext';
import { GoogleAuthModal, GoogleAccount } from '../components/modals/GoogleAuthModal';
import { ClaimVaultLogo } from '../components/ui/ClaimVaultLogo';
import { authService } from '../services/authService';

interface SignupScreenProps {
  onGoToLogin: () => void;
  onSignupSuccess?: () => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ onGoToLogin, onSignupSuccess }) => {
  const [step, setStep] = useState<'form' | 'verify_otp'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [activeCodeHint, setActiveCodeHint] = useState<string | null>(null);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    otp?: string;
  }>({});

  const { signup, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: any;
    if (step === 'verify_otp' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

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

  const validateForm = () => {
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

  const handleInitiateSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await authService.requestAccountVerificationOtp(email.trim(), name.trim());
      setIsLoading(false);
      setStep('verify_otp');
      setCountdown(60);
      setActiveCodeHint(res.code);
      showToast(`Verification code sent via Brevo to ${email}`, 'success');
    } catch {
      setIsLoading(false);
      showToast('Could not send verification email. Please try again.', 'error');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    try {
      const res = await authService.requestAccountVerificationOtp(email.trim(), name.trim());
      setCountdown(60);
      setActiveCodeHint(res.code);
      showToast('New verification code sent to your email', 'success');
    } catch {
      showToast('Failed to resend code', 'error');
    } finally {
      setIsResending(false);
    }
  };

  const handleConfirmVerificationAndCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpDigits.join('');

    if (enteredCode.length !== 6) {
      setErrors({ otp: 'Please enter all 6 digits of the code' });
      return;
    }

    if (!authService.verifyAccountOtp(email, enteredCode)) {
      setErrors({ otp: 'Invalid or expired code. Please verify and try again.' });
      return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      await signup(name, email, password);
      showToast(`Welcome to ${THEME.app.name}, ${name}!`, 'success');
      if (onSignupSuccess) {
        onSignupSuccess();
      }
    } catch {
      showToast('Account creation failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col justify-between p-6 bg-white overflow-y-auto">
      <div className="space-y-4 pt-2">
        <button
          type="button"
          onClick={step === 'verify_otp' ? () => setStep('form') : onGoToLogin}
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-muted hover:text-brand-navy"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{step === 'verify_otp' ? 'Edit Details' : 'Back to Login'}</span>
        </button>

        {/* STEP 1: INITIAL SIGNUP FORM */}
        {step === 'form' && (
          <div className="space-y-4">
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

            <form onSubmit={handleInitiateSignup} className="space-y-3 pt-1">
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
                Continue & Verify Email
              </Button>
            </form>
          </div>
        )}

        {/* STEP 2: VERIFY EMAIL OTP */}
        {step === 'verify_otp' && (
          <div className="space-y-4 pt-1">
            <div className="flex flex-col items-center text-center space-y-1">
              <div className="w-12 h-12 bg-teal-50 text-brand-teal rounded-2xl flex items-center justify-center mb-1 shadow-sm">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-extrabold text-brand-navy tracking-tight">
                Verify Your Email
              </h1>
              <p className="text-xs text-brand-muted max-w-xs leading-relaxed">
                We sent a 6-digit confirmation code via Brevo to <strong className="text-brand-navy">{email}</strong>
              </p>
            </div>

            <form onSubmit={handleConfirmVerificationAndCreate} className="space-y-5 pt-2">
              {/* Instant OTP Helper & Security Banner */}
              {activeCodeHint && (
                <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3 text-left shadow-xs">
                  <div className="space-y-0.5">
                    <div className="text-[10px] uppercase font-extrabold text-amber-800 tracking-wider">
                      Live Verification Code
                    </div>
                    <div className="text-sm font-black font-mono text-amber-950 tracking-wider">
                      {activeCodeHint}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpDigits(activeCodeHint.split(''))}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold transition shrink-0"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-navy block text-center">
                  Enter 6-Digit Code
                </label>
                <div className="flex justify-center gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className={`w-11 h-12 text-center text-lg font-extrabold rounded-xl border font-mono transition outline-none ${
                        digit
                          ? 'border-brand-teal bg-teal-50/30 text-brand-navy ring-1 ring-brand-teal'
                          : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-teal focus:bg-white'
                      }`}
                    />
                  ))}
                </div>
                {errors.otp && (
                  <p className="text-xs text-rose-500 font-medium text-center">{errors.otp}</p>
                )}
              </div>

              {/* Resend Code */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || isResending}
                  className={`text-xs font-semibold inline-flex items-center gap-1 ${
                    countdown > 0
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-brand-teal hover:underline cursor-pointer'
                  }`}
                >
                  <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                  <span>
                    {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code now'}
                  </span>
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-teal shrink-0" />
                <span>Verification protects your ClaimVault receipts and warranty claims.</span>
              </div>

              <Button
                type="submit"
                variant="action"
                size="lg"
                fullWidth
                isLoading={isLoading}
              >
                Complete Account Creation
              </Button>
            </form>
          </div>
        )}
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
