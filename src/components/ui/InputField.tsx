import React, { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  prefixText?: string;
  containerClassName?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      prefixText,
      containerClassName = '',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="text-xs font-bold text-brand-navy tracking-tight">
            {label}
            {props.required && <span className="text-brand-red ml-0.5">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-brand-muted pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          {prefixText && (
            <div className="absolute left-3.5 text-xs font-bold text-brand-muted pointer-events-none select-none">
              {prefixText}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`w-full bg-white text-brand-navy placeholder:text-brand-subtle text-sm font-medium rounded-xl border transition-all duration-150 py-3 ${
              leftIcon ? 'pl-10' : prefixText ? 'pl-11' : 'pl-3.5'
            } ${rightIcon ? 'pr-10' : 'pr-3.5'} ${
              error
                ? 'border-brand-red focus:border-brand-red focus:ring-2 focus:ring-brand-red/20'
                : 'border-brand-border focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20'
            } focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 text-brand-muted flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-[11px] font-semibold text-brand-red flex items-center gap-1 mt-0.5">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-brand-muted mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
