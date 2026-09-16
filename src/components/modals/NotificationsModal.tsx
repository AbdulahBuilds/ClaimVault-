import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Bell, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCheck, 
  Send, 
  Trash2, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/dateUtils';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (productId: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications,
    sendSampleNotification
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'scheduled'>('all');

  if (!isOpen) return null;

  const scheduledCount = notifications.filter((n) => n.status === 'scheduled').length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.isRead;
    if (activeTab === 'scheduled') return n.status === 'scheduled';
    return true;
  });

  const handleItemClick = (notif: typeof notifications[0]) => {
    markAsRead(notif.id);
    if (notif.productId && onSelectProduct) {
      onClose();
      onSelectProduct(notif.productId);
    }
  };

  const tabs: Array<{ id: 'all' | 'unread' | 'scheduled'; label: string; count: number }> = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'scheduled', label: 'Scheduled', count: scheduledCount },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-float border border-brand-border flex flex-col max-h-[88vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-navy text-white flex items-center justify-center relative shadow-sm">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-red text-[9px] font-extrabold flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-navy">Push Notifications</h3>
                <p className="text-[11px] text-brand-muted">
                  {unreadCount} unread • {notifications.length} total alerts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-brand-teal font-bold hover:underline flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-teal-50 transition"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark read</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-brand-navy flex items-center justify-center transition active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Spacious Full-Width Segmented Filter Pills */}
          <div className="px-4 py-3 bg-white border-b border-brand-border">
            <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-2xl gap-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-3 rounded-xl font-bold text-xs transition-all duration-150 flex items-center justify-center gap-1.5 active:scale-95 ${
                      isActive
                        ? 'bg-brand-navy text-white shadow-sm'
                        : 'text-slate-600 hover:text-brand-navy hover:bg-slate-200/70'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold leading-none ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-brand-muted text-xs flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-brand-muted flex items-center justify-center mb-2 shadow-sm">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="font-bold text-brand-navy mb-0.5">No notifications in this view</p>
                <p className="text-[11px] max-w-xs text-brand-muted mb-4">
                  ClaimVault monitors deadlines and delivers alerts automatically before cutoff dates.
                </p>
                <button
                  onClick={() => sendSampleNotification()}
                  className="px-3.5 py-2 rounded-xl bg-teal-50 border border-teal-200 text-xs font-bold text-brand-teal hover:bg-teal-100 transition flex items-center gap-1.5 active:scale-95 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Send Test Push Notification</span>
                </button>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isReturn = notif.type === 'return';
                const isScheduled = notif.status === 'scheduled';

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleItemClick(notif)}
                    className={`p-3.5 rounded-2xl border transition-all duration-150 flex items-start gap-3 cursor-pointer ${
                      !notif.isRead
                        ? 'bg-teal-50/40 border-teal-200 shadow-sm hover:border-teal-300'
                        : isScheduled
                        ? 'bg-slate-50 border-slate-200 opacity-80'
                        : 'bg-white border-brand-border hover:shadow-card'
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center mt-0.5 shadow-sm ${
                        isReturn
                          ? 'bg-amber-100 text-amber-800'
                          : isScheduled
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-teal-100 text-brand-teal'
                      }`}
                    >
                      {isReturn ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : isScheduled ? (
                        <Calendar className="w-4 h-4" />
                      ) : (
                        <ShieldCheck className="w-4 h-4" />
                      )}
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-bold text-brand-navy truncate">
                            {notif.productName}
                          </span>
                          {!notif.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-teal shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-brand-muted shrink-0 font-medium">
                          {isScheduled && notif.scheduledFor
                            ? `Due ${formatDate(notif.scheduledFor)}`
                            : 'Just Now'}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-brand-navy leading-tight mb-1">
                        {notif.title}
                      </p>

                      <p className="text-[11px] text-brand-muted leading-relaxed">
                        {notif.body}
                      </p>

                      {notif.leadTimeDays !== undefined && (
                        <div className="mt-1.5 flex items-center gap-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {notif.leadTimeDays === 0
                              ? 'Triggered On Deadline'
                              : `${notif.leadTimeDays} Days Lead Alert`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Actions with Dedicated Test Push Button */}
          <div className="px-4 py-3 bg-slate-50 border-t border-brand-border flex items-center justify-between gap-2">
            {notifications.length > 0 ? (
              <button
                onClick={clearNotifications}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1.5 transition px-2 py-1 rounded-lg hover:bg-rose-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear history</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium">Auto-monitoring active</span>
            )}

            <button
              onClick={() => sendSampleNotification()}
              className="text-xs font-bold text-brand-teal bg-teal-50 hover:bg-teal-100/80 border border-teal-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              title="Trigger a test device push notification"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Test Push</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
