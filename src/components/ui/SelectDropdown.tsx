import React, { SelectHTMLAttributes, ReactNode, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SelectDropdownProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  containerClassName?: string;
}

export const SelectDropdown = forwardRef<HTMLSelectElement, SelectDropdownProps>(
  (
    {
      label,
      options,
      error,
      helperText,
      leftIcon,
      containerClassName = '',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label htmlFor={selectId} className="text-xs font-bold text-brand-navy tracking-tight">
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

          <select
            ref={ref}
            id={selectId}
            className={`w-full bg-white text-brand-navy text-sm font-medium rounded-xl border transition-all duration-150 py-3 appearance-none cursor-pointer ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } pr-10 ${
              error
                ? 'border-brand-red focus:border-brand-red focus:ring-2 focus:ring-brand-red/20'
                : 'border-brand-border focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20'
            } focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="text-brand-navy py-1.5">
                {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3.5 text-brand-muted pointer-events-none flex items-center justify-center">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error ? (
          <p className="text-[11px] font-semibold text-brand-red mt-0.5">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-brand-muted mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

SelectDropdown.displayName = 'SelectDropdown';
