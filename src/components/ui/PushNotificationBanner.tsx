import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ShieldCheck, AlertTriangle, X, ChevronRight, Clock } from 'lucide-react';
import { PushNotificationItem } from '../../services/notificationService';

interface PushNotificationBannerProps {
  notification: PushNotificationItem | null;
  onDismiss: () => void;
  onTap?: (productId?: string) => void;
}

export const PushNotificationBanner: React.FC<PushNotificationBannerProps> = ({
  notification,
  onDismiss,
  onTap,
}) => {
  if (!notification) return null;

  const isReturn = notification.type === 'return';

  return (
    <AnimatePresence>
      <div className="absolute top-8 left-3 right-3 z-[150] pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={() => {
            if (onTap) onTap(notification.productId);
            onDismiss();
          }}
          className="w-full bg-slate-900/95 backdrop-blur-xl border border-white/20 text-white p-3.5 rounded-2xl shadow-float cursor-pointer flex items-start gap-3 hover:bg-slate-900 transition"
        >
          {/* App Icon / Notification Badge */}
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              isReturn ? 'bg-amber-500 text-white' : 'bg-brand-teal text-white'
            }`}
          >
            {isReturn ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 flex items-center gap-1">
                ClaimVault • Just Now
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/20 text-teal-200">
                {isReturn ? 'Return Notice' : 'Warranty Alert'}
              </span>
            </div>

            <h4 className="text-xs font-bold text-white truncate leading-tight">
              {notification.title}
            </h4>

            <p className="text-[11px] text-slate-200 leading-snug mt-0.5 line-clamp-2">
              {notification.body}
            </p>
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition shrink-0 mt-0.5"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
