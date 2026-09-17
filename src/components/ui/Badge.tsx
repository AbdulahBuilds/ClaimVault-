import React from 'react';
import { UrgencyStatus } from '../../types';
import { CheckCircle2, Clock, AlertCircle, Sparkles } from 'lucide-react';

interface BadgeProps {
  status?: UrgencyStatus;
  variant?: 'solid' | 'subtle' | 'outline';
  customLabel?: string;
  size?: 'sm' | 'md';
  icon?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status = 'safe',
  variant = 'subtle',
  customLabel,
  size = 'sm',
  icon = true,
  className = '',
}) => {
  const configs = {
    safe: {
      label: 'Active',
      icon: CheckCircle2,
      subtle: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      solid: 'bg-emerald-600 text-white border-transparent',
      outline: 'bg-transparent text-emerald-700 border-emerald-400',
    },
    expiring: {
      label: 'Expiring Soon',
      icon: Clock,
      subtle: 'bg-amber-50 text-amber-800 border-amber-200/80',
      solid: 'bg-amber-500 text-white border-transparent',
      outline: 'bg-transparent text-amber-700 border-amber-400',
    },
    expired: {
      label: 'Expired',
      icon: AlertCircle,
      subtle: 'bg-rose-50 text-rose-700 border-rose-200/80',
      solid: 'bg-rose-600 text-white border-transparent',
      outline: 'bg-transparent text-rose-700 border-rose-400',
    },
  };

  const config = configs[status];
  const IconComponent = config.icon;
  const label = customLabel || config.label;

  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${sizeClasses} ${config[variant]} ${className}`}
    >
      {icon && <IconComponent className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />}
      <span>{label}</span>
    </span>
  );
};

export const CategoryBadge: React.FC<{ label: string; className?: string }> = ({ label, className = '' }) => {
  return (
    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60 ${className}`}>
      {label}
    </span>
  );
};

export const AIPoweredBadge: React.FC<{ label?: string; className?: string }> = ({ label = 'AI Vision', className = '' }) => {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-teal text-white shadow-sm ${className}`}>
      <Sparkles className="w-3 h-3 text-teal-200 animate-pulse" />
      <span>{label}</span>
    </span>
  );
};

export const AIComingSoonBadge = AIPoweredBadge;
