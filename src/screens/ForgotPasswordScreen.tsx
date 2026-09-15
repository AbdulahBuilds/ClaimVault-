import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { InputField } from '../components/ui/InputField';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { ClaimVaultLogo } from '../components/ui/ClaimVaultLogo';

interface ForgotPasswordScreenProps {
  onGoToLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onGoToLogin }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsLoading(false);
    setIsSubmitted(true);
    showToast('Password reset link sent to your email', 'success');
  };

  return (
    <div className="h-full flex flex-col justify-between p-6 bg-white">
      <div className="space-y-5 pt-2">
        <button
          type="button"
          onClick={onGoToLogin}
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-muted hover:text-brand-navy"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </button>

        {isSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-brand-navy">Check Your Email</h2>
            <p className="text-xs text-brand-muted max-w-xs mx-auto leading-relaxed">
              We have sent a password reset link to <strong className="text-brand-navy">{email}</strong>. Follow the instructions in the email to reset your password.
            </p>
            <Button variant="primary" size="md" fullWidth onClick={onGoToLogin} className="mt-4">
              Return to Login
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center text-center space-y-2 pt-1">
              <ClaimVaultLogo size="md" />
              <div className="space-y-1">
                <h1 className="text-2xl font-extrabold text-brand-navy tracking-tight">
                  Reset Password
                </h1>
                <p className="text-xs font-medium text-brand-muted">
                  Enter your email and we'll send you recovery instructions
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
              >
                Send Reset Link
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
