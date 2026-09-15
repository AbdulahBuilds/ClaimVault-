import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { InputField } from '../components/ui/InputField';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { THEME } from '../constants/theme';
import { useToast } from '../context/ToastContext';

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
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const { signup } = useAuth();
  const { showToast } = useToast();

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
      <div className="space-y-5 pt-2">
        <button
          type="button"
          onClick={onGoToLogin}
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-muted hover:text-brand-navy"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </button>

        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-brand-navy tracking-tight">
            Create Account
          </h1>
          <p className="text-xs font-medium text-brand-muted">
            Start protecting your purchases, receipts & warranties
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-3.5 pt-1">
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
            className="mt-3"
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
    </div>
  );
};
