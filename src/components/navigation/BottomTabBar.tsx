import React from 'react';
import { Home, Package, Plus, Bell, User } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { triggerHaptic } from '../../utils/haptics';

export type TabKey = 'home' | 'products' | 'add' | 'reminders' | 'profile';

interface BottomTabBarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onSelectTab }) => {
  const { reminders } = useProducts();

  const pendingRemindersCount = reminders.filter((r) => !r.isCompleted).length;

  const handleTabSelect = (tab: TabKey) => {
    triggerHaptic(tab === 'add' ? 'medium' : 'selection');
    onSelectTab(tab);
  };

  const tabs: { key: TabKey; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'products', label: 'Products', icon: Package },
    { key: 'add', label: 'Add', icon: Plus },
    { key: 'reminders', label: 'Reminders', icon: Bell },
    { key: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="w-full bg-white border-t border-brand-border px-3 py-2 shrink-0 z-40 shadow-card">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {tabs.map((tab) => {
          const isAdd = tab.key === 'add';
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;

          if (isAdd) {
            return (
              <button
                key={tab.key}
                onClick={() => handleTabSelect(tab.key)}
                className="relative -top-5 flex flex-col items-center group focus:outline-none"
                aria-label="Add Product"
              >
                <div
                  className={`w-13 h-13 rounded-2xl bg-brand-teal text-white flex items-center justify-center shadow-lg shadow-brand-teal/35 p-3.5 transition-all duration-200 transform group-hover:scale-105 active:scale-95 border-2 border-white ${
                    isActive ? 'ring-4 ring-brand-teal/20 bg-teal-700' : ''
                  }`}
                >
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span
                  className={`text-[10px] font-bold mt-1 tracking-tight transition-colors ${
                    isActive ? 'text-brand-teal' : 'text-brand-muted'
                  }`}
                >
                  Add
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.key}
              onClick={() => handleTabSelect(tab.key)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 relative group ${
                isActive ? 'text-brand-navy' : 'text-brand-muted hover:text-brand-navy'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 group-active:scale-90 ${
                    isActive ? 'text-brand-navy stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />

                {/* Reminder Badge count */}
                {tab.key === 'reminders' && pendingRemindersCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-brand-red text-white text-[9px] font-extrabold flex items-center justify-center shadow-sm">
                    {pendingRemindersCount}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] font-semibold mt-1 tracking-tight ${
                  isActive ? 'text-brand-navy font-bold' : 'text-brand-muted'
                }`}
              >
                {tab.label}
              </span>

              {/* Active Indicator Bar */}
              {isActive && (
                <div className="w-4 h-0.5 bg-brand-teal rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* iOS Home Bar Indicator */}
      <div className="w-32 h-1 bg-slate-300 rounded-full mx-auto mt-2" />
    </div>
  );
};
