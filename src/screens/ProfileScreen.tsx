import React, { useState } from 'react';
import { 
  Bell, 
  Coins, 
  HelpCircle, 
  Info, 
  LogOut, 
  ChevronRight, 
  Shield, 
  Download, 
  Check,
  Edit3,
  Lock,
  UserCheck,
  Camera,
  Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useNotifications } from '../context/NotificationContext';
import { THEME } from '../constants/theme';
import { formatPKR } from '../utils/currencyUtils';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

// Profile Modals
import { EditProfileModal } from '../components/modals/EditProfileModal';
import { CurrencyModal } from '../components/modals/CurrencyModal';
import { PrivacyModal } from '../components/modals/PrivacyModal';
import { HelpSupportModal } from '../components/modals/HelpSupportModal';
import { AboutModal } from '../components/modals/AboutModal';

interface ProfileScreenProps {
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const { user, logout } = useAuth();
  const { stats } = useProducts();
  const { 
    preferences, 
    updatePreferences, 
    sendSampleNotification, 
    openPermissionModal, 
    requestPermission,
    hasPermission,
    devicePermission 
  } = useNotifications();
  const { showToast } = useToast();

  // Modal States
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const toggleLeadTime = (days: number) => {
    const current = preferences.leadTimes || [30, 7, 3, 1, 0];
    const next = current.includes(days)
      ? current.filter((d) => d !== days)
      : [...current, days];
    updatePreferences({ leadTimes: next });
  };

  const handleTogglePush = async () => {
    const nextState = !preferences.enabled;
    updatePreferences({ enabled: nextState });
    if (nextState && !hasPermission) {
      await requestPermission();
    }
  };

  const handleConfirmLogout = async () => {
    await logout();
    showToast('Logged out successfully', 'info');
    onLogout();
  };

  const currentCurrency = user?.currency || 'PKR';

  return (
    <div className="h-full w-full max-w-full flex flex-col bg-brand-bg overflow-hidden">
      {/* Profile Header */}
      <div className="bg-white p-5 border-b border-brand-border shrink-0 z-10 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div 
            onClick={() => setIsEditProfileOpen(true)}
            className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer group"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-navy via-slate-800 to-teal-800 text-white flex items-center justify-center font-extrabold text-2xl shadow-card overflow-hidden border border-slate-200 group-hover:scale-105 transition">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user?.name || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{(user?.name || 'U').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div 
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-xl bg-brand-teal text-white flex items-center justify-center border-2 border-white shadow-sm group-hover:scale-110 transition"
                title="Tap to upload photo or edit profile"
              >
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-brand-navy truncate group-hover:text-brand-teal transition">
                  {user?.name || 'User'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-teal text-white shadow-sm">
                  PRO
                </span>
              </div>
              <p className="text-xs text-brand-muted truncate mt-0.5">
                {user?.email || 'user@claimvault.com'}
              </p>
              <p className="text-[10px] text-brand-muted mt-0.5 flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-brand-teal" /> Verified Vault Owner
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-brand-navy flex items-center justify-center transition active:scale-95 shrink-0"
            title="Edit Profile"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Protection Value Stats Banner */}
        <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-brand-navy via-slate-800 to-teal-900 text-white flex items-center justify-between shadow-card">
          <div>
            <span className="text-[10px] uppercase font-bold text-teal-200 tracking-wider">
              Total Protected Value
            </span>
            <p className="text-lg font-extrabold text-white mt-0.5">
              {formatPKR(stats.totalProtectedValue || 0)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-300">Active Vault Items</span>
            <p className="text-sm font-bold text-teal-300">{stats.totalProducts} Products</p>
          </div>
        </div>
      </div>

      {/* Settings Scrollable Sections */}
      <div className="p-4 space-y-4 pb-12 flex-1 w-full max-w-full overflow-y-auto no-scrollbar">
        {/* Section 1: Notifications & Reminder Preferences */}
        <div className="bg-white rounded-2xl border border-brand-border shadow-card overflow-hidden">
          <div className="px-4 py-3 bg-slate-50/80 border-b border-brand-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
              Reminder Preferences
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Push Notifications Toggle */}
            <div className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-brand-teal flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-navy">Push Reminders</p>
                  <p className="text-[11px] text-brand-muted">Get alerts before expiry & returns</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTogglePush}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  preferences.enabled ? 'bg-brand-teal' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${
                    preferences.enabled ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Device Permission Status Indicator */}
            <div className="px-4 py-2.5 bg-slate-50/60 flex items-center justify-between border-y border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  devicePermission === 'granted'
                    ? 'bg-emerald-500 animate-pulse'
                    : devicePermission === 'denied'
                    ? 'bg-rose-500'
                    : 'bg-amber-500'
                }`} />
                <span className="text-[11px] font-semibold text-brand-navy">
                  {devicePermission === 'granted'
                    ? 'Device Push Ready'
                    : devicePermission === 'denied'
                    ? 'Device Push Blocked in Browser'
                    : 'Device Permission Needed'}
                </span>
              </div>

              {devicePermission !== 'granted' && (
                <button
                  type="button"
                  onClick={() => requestPermission()}
                  className="text-[11px] font-bold text-brand-teal bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2 py-0.5 rounded-lg transition"
                >
                  Enable on Device
                </button>
              )}
            </div>

            {/* Reminder Lead Times */}
            <div className="p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-brand-navy">Alert Timings (Lead Times)</p>
                <span className="text-[10px] text-brand-muted">Configure triggers</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { days: 30, label: '30 Days' },
                  { days: 14, label: '14 Days' },
                  { days: 7, label: '7 Days' },
                  { days: 3, label: '3 Days' },
                  { days: 1, label: '1 Day' },
                  { days: 0, label: 'On Deadline' },
                ].map((item) => {
                  const isSelected = (preferences.leadTimes || [30, 7, 3, 1, 0]).includes(item.days);
                  return (
                    <button
                      key={item.days}
                      type="button"
                      onClick={() => toggleLeadTime(item.days)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold transition active:scale-95 ${
                        isSelected
                          ? 'bg-brand-navy text-white shadow-sm'
                          : 'bg-slate-100 text-brand-muted hover:text-brand-navy hover:bg-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Test Notification Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => sendSampleNotification()}
                  className="w-full py-2.5 px-3 rounded-xl bg-teal-50 hover:bg-teal-100/70 border border-teal-200 text-brand-teal text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98 shadow-sm"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Send Test Push Notification</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Account & Currency Preferences */}
        <div className="bg-white rounded-2xl border border-brand-border shadow-card overflow-hidden">
          <div className="px-4 py-3 bg-slate-50/80 border-b border-brand-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
              Preferences & Vault Security
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Currency Selector */}
            <div 
              onClick={() => setIsCurrencyOpen(true)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-brand-navy flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-navy">Display Currency</p>
                  <p className="text-[11px] text-brand-muted">
                    {currentCurrency === 'PKR' ? 'Pakistani Rupee (PKR)' : `${currentCurrency} selected`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-brand-teal px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200">
                  {currentCurrency}
                </span>
                <ChevronRight className="w-4 h-4 text-brand-muted" />
              </div>
            </div>

            {/* Privacy & Security */}
            <div
              onClick={() => setIsPrivacyOpen(true)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-brand-navy flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-navy">Privacy & Security</p>
                  <p className="text-[11px] text-brand-muted">Local encrypted storage & export</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-brand-muted" />
            </div>
          </div>
        </div>

        {/* Section 3: Support & About */}
        <div className="bg-white rounded-2xl border border-brand-border shadow-card overflow-hidden">
          <div className="divide-y divide-slate-100">
            {/* Help & Support */}
            <div
              onClick={() => setIsHelpOpen(true)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-brand-navy flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-navy">Help & Support</p>
                  <p className="text-[11px] text-brand-muted">FAQs and Claim Assistance</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-brand-muted" />
            </div>

            {/* About ClaimVault */}
            <div 
              onClick={() => setIsAboutOpen(true)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3">
                <img
                  src="/claimvault-logo.png"
                  alt="ClaimVault"
                  className="w-8 h-8 object-contain rounded-xl border border-slate-200 bg-white"
                />
                <div>
                  <p className="text-xs font-bold text-brand-navy">About {THEME.app.name}</p>
                  <p className="text-[11px] text-brand-muted">Smart purchase & warranty manager</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <ChevronRight className="w-4 h-4 text-brand-muted" />
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-2">
          {showLogoutConfirm ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
              <p className="text-xs font-bold text-brand-red">Are you sure you want to log out?</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  fullWidth
                  onClick={handleConfirmLogout}
                >
                  Confirm Logout
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="lg"
              fullWidth
              leftIcon={<LogOut className="w-4 h-4 text-brand-red" />}
              onClick={() => setShowLogoutConfirm(true)}
              className="text-brand-red hover:bg-rose-50 border-rose-200"
            >
              Logout
            </Button>
          )}
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />

      <CurrencyModal
        isOpen={isCurrencyOpen}
        onClose={() => setIsCurrencyOpen(false)}
      />

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <HelpSupportModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
};
