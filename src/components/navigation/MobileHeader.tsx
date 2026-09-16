import React, { ReactNode } from 'react';
import { ArrowLeft, Bell, Sparkles } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useNotifications } from '../../context/NotificationContext';

interface MobileHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
  onOpenNotifications?: () => void;
  isDashboard?: boolean;
  userName?: string;
  className?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  onOpenNotifications,
  isDashboard = false,
  userName = 'User',
  className = '',
}) => {
  const { unreadCount } = useNotifications();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (isDashboard) {
    return (
      <div className={`w-full px-5 pt-3 pb-4 bg-brand-bg flex items-center justify-between border-b border-brand-border/60 shrink-0 ${className}`}>
        <div className="flex items-center gap-3">
          <img
            src="/claimvault-logo.png"
            alt="ClaimVault"
            className="w-10 h-10 object-contain rounded-xl shadow-sm border border-slate-200/80 shrink-0 bg-white"
          />
          <div>
            <h1 className="text-lg font-extrabold text-brand-navy tracking-tight leading-tight">
              {getGreeting()}, {userName}
            </h1>
            <p className="text-[11px] font-medium text-brand-muted mt-0.5">
              Keep your purchases protected.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {rightAction}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative w-10 h-10 rounded-2xl bg-white border border-brand-border shadow-sm flex items-center justify-center text-brand-navy hover:bg-slate-50 transition active:scale-95"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5 stroke-[2]" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-brand-orange border-2 border-white ring-1 ring-brand-orange/30 animate-pulse" />
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full px-4 py-3.5 bg-brand-bg flex items-center justify-between border-b border-brand-border/60 shrink-0 ${className}`}>
      <div className="flex items-center gap-3 min-w-0">
        {showBack && (
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white border border-brand-border shadow-sm flex items-center justify-center text-brand-navy hover:bg-slate-50 transition active:scale-95 shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}

        <div className="min-w-0">
          <h1 className="text-base font-bold text-brand-navy truncate">{title}</h1>
          {subtitle && <p className="text-[11px] text-brand-muted truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">{rightAction}</div>
    </div>
  );
};
