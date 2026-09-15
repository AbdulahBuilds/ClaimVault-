import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export type ButtonVariant = 'primary' | 'action' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  haptic?: boolean;
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  haptic = true,
  disabled,
  onClick,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 active:scale-[0.97] select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'text-xs px-3 py-2 gap-1.5 min-h-[36px]',
    md: 'text-sm px-4 py-2.5 gap-2 min-h-[44px]',
    lg: 'text-base px-5 py-3.5 gap-2.5 min-h-[52px]',
  };

  const variantStyles = {
    primary: 'bg-brand-navy hover:bg-brand-navy-dark text-white shadow-sm active:bg-brand-navy-dark',
    action: 'bg-brand-teal hover:bg-teal-700 text-white shadow-sm shadow-brand-teal/20 active:bg-teal-800',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-brand-navy active:bg-slate-300',
    outline: 'border border-brand-border bg-white hover:bg-slate-50 text-brand-navy active:bg-slate-100',
    danger: 'bg-brand-red hover:bg-red-700 text-white shadow-sm active:bg-red-800',
    ghost: 'bg-transparent hover:bg-slate-100/70 text-brand-muted hover:text-brand-navy active:bg-slate-200/50',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (haptic && !disabled && !isLoading) {
      triggerHaptic(variant === 'danger' ? 'warning' : 'light');
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      onClick={handleClick}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
          <span>Please wait...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
