import React, { useState, useEffect, useRef } from 'react';
import { Mail, ArrowLeft, CheckCircle2, Lock, Eye, EyeOff, KeyRound, RefreshCw, ShieldCheck } from 'lucide-react';
import { InputField } from '../components/ui/InputField';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { ClaimVaultLogo } from '../components/ui/ClaimVaultLogo';
import { authService } from '../services/authService';

interface ForgotPasswordScreenProps {
  onGoToLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onGoToLogin }) => {
  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [errors, setErrors] = useState<{ email?: string; otp?: string; password?: string; confirmPassword?: string }>({});

  const { showToast } = useToast();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: any;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    const isRegistered = await authService.isEmailRegisteredAsync(email.trim());
    if (!isRegistered) {
      setErrors({ email: 'No account found with this email address. Please create an account.' });
      return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      await authService.requestPasswordResetOtp(email.trim());
      setIsLoading(false);
      setStep('otp');
      setCountdown(60);
      showToast(`Verification code sent to ${email}`, 'success');
    } catch {
      setIsLoading(false);
      showToast('Could not send recovery email. Please check your connection.', 'error');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    try {
      await authService.requestPasswordResetOtp(email.trim());
      setCountdown(60);
      showToast('New verification code sent to your email', 'success');
    } catch {
      showToast('Failed to resend code', 'error');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpDigits.join('');

    const newErrors: { otp?: string; password?: string; confirmPassword?: string } = {};

    if (enteredCode.length !== 6) {
      newErrors.otp = 'Please enter the complete 6-digit code';
    } else if (!authService.verifyPasswordResetOtp(email, enteredCode)) {
      newErrors.otp = 'Invalid or expired code. Please verify and try again.';
    }

    if (!newPassword) {
      newErrors.password = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      await authService.completePasswordReset(email, newPassword);
      setIsLoading(false);
      setStep('success');
      showToast('Password reset successfully! You can now log in.', 'success');
    } catch {
      setIsLoading(false);
      showToast('Failed to reset password. Please try again.', 'error');
    }
  };

  return (
    <div className="h-full flex flex-col justify-between p-6 bg-white overflow-y-auto">
      <div className="space-y-4 pt-2">
        <button
          type="button"
          onClick={onGoToLogin}
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-muted hover:text-brand-navy transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </button>

        {/* STEP 1: ENTER EMAIL */}
        {step === 'email' && (
          <div className="space-y-4 pt-1">
            <div className="flex flex-col items-center text-center space-y-2">
              <ClaimVaultLogo size="md" />
              <div className="space-y-1">
                <h1 className="text-2xl font-extrabold text-brand-navy tracking-tight">
                  Reset Password
                </h1>
                <p className="text-xs font-medium text-brand-muted">
                  Enter your email and we'll send you a 6-digit recovery code
                </p>
              </div>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4 pt-2">
              <InputField
                label="Registered Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email}
                required
              />

              <div className="p-3 bg-teal-50/60 border border-teal-200/70 rounded-xl text-[11px] text-teal-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                <span>We use Brevo enterprise email delivery to securely send your 6-digit recovery OTP.</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
              >
                Send Recovery Code
              </Button>
            </form>
          </div>
        )}

        {/* STEP 2: ENTER OTP & NEW PASSWORD */}
        {step === 'otp' && (
          <div className="space-y-4 pt-1">
            <div className="flex flex-col items-center text-center space-y-1">
              <div className="w-12 h-12 bg-teal-50 text-brand-teal rounded-2xl flex items-center justify-center mb-1">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-extrabold text-brand-navy tracking-tight">
                Verify & Set Password
              </h1>
              <p className="text-xs text-brand-muted max-w-xs">
                Enter the 6-digit code sent to <strong className="text-brand-navy">{email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyAndReset} className="space-y-4 pt-1">
              {/* 6-Digit OTP Input Row */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-navy block text-center">
                  6-Digit Verification Code
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

              {/* Resend Code Button */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
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

              {/* New Password Fields */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <InputField
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={errors.password}
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
                  label="Confirm New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={errors.confirmPassword}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                className="mt-2"
              >
                Reset & Update Password
              </Button>
            </form>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 'success' && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-brand-navy">Password Updated!</h2>
            <p className="text-xs text-brand-muted max-w-xs mx-auto leading-relaxed">
              Your ClaimVault password has been successfully updated. You can now log in with your new credentials.
            </p>
            <Button variant="primary" size="lg" fullWidth onClick={onGoToLogin} className="mt-4">
              Log In Now
            </Button>
          </div>
        )}
      </div>

      <div className="text-center py-3 border-t border-slate-100 mt-4">
        <p className="text-xs text-brand-muted">
          Remember your password?{' '}
          <button
            type="button"
            onClick={onGoToLogin}
            className="text-brand-teal font-bold hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};
