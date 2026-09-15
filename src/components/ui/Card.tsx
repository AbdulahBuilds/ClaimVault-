import React, { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'flat' | 'outline' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const base = 'rounded-2xl bg-white transition-all duration-200';

  const variantStyles = {
    default: 'border border-brand-border shadow-card hover:shadow-card-hover',
    flat: 'border border-brand-border bg-slate-50/70',
    outline: 'border border-brand-border shadow-none',
    interactive: 'border border-brand-border shadow-card hover:shadow-card-hover active:scale-[0.99] cursor-pointer',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };

  return (
    <div
      className={`${base} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
