import React, { ReactNode } from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-dashed border-brand-border ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-brand-teal-subtle text-brand-teal flex items-center justify-center mb-4 shadow-sm">
        {icon || <PackageOpen className="w-8 h-8" />}
      </div>

      <h3 className="text-base font-bold text-brand-navy mb-1.5">{title}</h3>
      <p className="text-xs text-brand-muted max-w-xs leading-relaxed mb-6">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-xs">
        {actionLabel && onAction && (
          <Button variant="action" size="md" fullWidth onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        {secondaryLabel && onSecondaryAction && (
          <Button variant="outline" size="md" fullWidth onClick={onSecondaryAction}>
            {secondaryLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
