import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ShieldCheck, Check, Clock, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllow: () => void;
}

export const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({
  isOpen,
  onClose,
  onAllow,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-float border border-brand-border flex flex-col items-center text-center"
        >
          {/* Top Bell Icon */}
          <div className="w-16 h-16 rounded-3xl bg-teal-50 text-brand-teal flex items-center justify-center mb-4 border border-teal-100 shadow-sm relative">
            <Bell className="w-8 h-8 animate-bounce" />
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-orange text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">
              !
            </div>
          </div>

          <h3 className="text-base font-extrabold text-brand-navy mb-1.5">
            Never Miss a Deadline
          </h3>
          <p className="text-xs text-brand-muted leading-relaxed mb-5">
            ClaimVault sends timely alerts before your return periods close and warranty coverage expires.
          </p>

          {/* Value Props list */}
          <div className="w-full space-y-2.5 mb-6 text-left bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <div className="flex items-start gap-2.5 text-xs text-brand-navy">
              <div className="w-5 h-5 rounded-md bg-emerald-100 text-brand-green flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div>
                <p className="font-bold">Automated Lead Times</p>
                <p className="text-[11px] text-brand-muted">Notified 7 days, 3 days, 1 day before & on deadline</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-brand-navy">
              <div className="w-5 h-5 rounded-md bg-teal-100 text-brand-teal flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold">Zero Spam Guarantee</p>
                <p className="text-[11px] text-brand-muted">Only essential alerts for your saved products</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 w-full">
            <Button
              variant="action"
              size="lg"
              fullWidth
              onClick={onAllow}
              leftIcon={<Bell className="w-4 h-4" />}
            >
              Enable Notifications
            </Button>

            <Button
              variant="ghost"
              size="md"
              fullWidth
              onClick={onClose}
              className="text-brand-muted"
            >
              Maybe Later
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
