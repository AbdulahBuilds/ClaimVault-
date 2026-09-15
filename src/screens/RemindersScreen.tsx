import React, { useState } from 'react';
import { Bell, CheckCircle2, Clock, Calendar, AlertTriangle, ShieldCheck, RotateCcw, Info, Sparkles } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { EmptyState } from '../components/ui/EmptyState';
import { ReminderCard } from '../components/cards/ReminderCard';

interface RemindersScreenProps {
  onSelectProduct: (productId: string) => void;
  onGoToAdd: () => void;
}

export const RemindersScreen: React.FC<RemindersScreenProps> = ({
  onSelectProduct,
  onGoToAdd,
}) => {
  const { reminders, dismissReminder } = useProducts();
  const [filterType, setFilterType] = useState<'all' | 'return' | 'warranty' | 'completed'>('all');

  // Completed filter vs active filters
  const completedReminders = reminders.filter((r) => r.isCompleted);
  const activeReminders = reminders.filter((r) => !r.isCompleted);

  const filteredReminders = reminders.filter((r) => {
    if (filterType === 'completed') return r.isCompleted;
    if (r.isCompleted) return false;
    if (filterType === 'return') return r.type === 'return';
    if (filterType === 'warranty') return r.type === 'warranty';
    return true;
  });

  // Buckets for active reminders
  const todayReminders = filteredReminders.filter((r) => r.timeBucket === 'today');
  const thisWeekReminders = filteredReminders.filter((r) => r.timeBucket === 'this_week');
  const laterReminders = filteredReminders.filter((r) => r.timeBucket === 'later');

  const pendingCount = activeReminders.length;
  const expiredCount = activeReminders.filter((r) => r.urgency === 'expired').length;

  return (
    <div className="h-full w-full max-w-full flex flex-col bg-brand-bg overflow-hidden">
      {/* Pinned Top Header */}
      <div className="w-full px-4 pt-4 pb-3 bg-white border-b border-brand-border shrink-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-extrabold text-brand-navy tracking-tight">
              Reminders
            </h1>
            <p className="text-xs font-medium text-brand-muted">
              {pendingCount} active {pendingCount === 1 ? 'alert' : 'alerts'} • {completedReminders.length} completed
            </p>
          </div>

          <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60 shadow-sm">
            <Bell className="w-4 h-4" />
          </div>
        </div>

        {/* Filter Pills with Badge Counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: 'All Alerts', count: activeReminders.length },
            { id: 'return', label: 'Returns', count: activeReminders.filter((r) => r.type === 'return').length },
            { id: 'warranty', label: 'Warranties', count: activeReminders.filter((r) => r.type === 'warranty').length },
            { id: 'completed', label: 'Completed', count: completedReminders.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 active:scale-95 ${
                filterType === tab.id
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'bg-slate-100 text-brand-muted hover:text-brand-navy hover:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  filterType === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Scrollable Reminders Feed */}
      <div className="p-4 space-y-5 pb-12 flex-1 w-full max-w-full overflow-y-auto no-scrollbar">
        {/* Timing Rules Info Bar */}
        <div className="p-3 rounded-2xl bg-slate-100/80 border border-slate-200/80 text-[11px] text-brand-muted flex items-start gap-2.5 shadow-sm">
          <Info className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-bold text-brand-navy block">Automated Rule Engine</span>
            <span>Alerts automatically trigger at <strong>7 days</strong>, <strong>3 days</strong>, <strong>1 day before</strong> & <strong>on deadline</strong>.</span>
          </div>
        </div>

        {/* Expired Alert Banner if any exist */}
        {expiredCount > 0 && filterType !== 'completed' && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-900 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-rose-100 text-brand-red flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold">{expiredCount} Expired {expiredCount === 1 ? 'Deadline' : 'Deadlines'}</p>
                <p className="text-[10px] text-rose-700">Immediate attention or claim needed</p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold bg-rose-200 text-rose-900 px-2 py-1 rounded-lg">
              Review
            </span>
          </div>
        )}

        {/* Reminders List & Categories */}
        {filteredReminders.length === 0 ? (
          <EmptyState
            title={filterType === 'completed' ? 'No completed reminders' : 'No reminders in this tab'}
            description={
              filterType === 'completed'
                ? 'When you check off a deadline reminder, it will appear here in your completed archive.'
                : 'All your purchases are currently up to date. Add products to generate automatic deadline alerts.'
            }
            actionLabel="Add Product"
            onAction={onGoToAdd}
            className="my-6"
          />
        ) : filterType === 'completed' ? (
          /* Completed Reminders Group */
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-brand-green flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                  Completed & Handled ({completedReminders.length})
                </h3>
              </div>
              <span className="text-[10px] text-brand-muted font-medium">Tap checkbox to reactivate</span>
            </div>

            <div className="space-y-2">
              {filteredReminders.map((rem) => (
                <ReminderCard
                  key={rem.id}
                  reminder={rem}
                  onToggleComplete={dismissReminder}
                  onClickProduct={onSelectProduct}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Active Reminders: 3 Categorized Buckets */
          <>
            {/* 1. Today Group */}
            {todayReminders.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-red" />
                    </span>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-red">
                      Today & Urgent ({todayReminders.length})
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Immediate Action
                  </span>
                </div>

                <div className="space-y-2">
                  {todayReminders.map((rem) => (
                    <ReminderCard
                      key={rem.id}
                      reminder={rem}
                      onToggleComplete={dismissReminder}
                      onClickProduct={onSelectProduct}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 2. This Week Group */}
            {thisWeekReminders.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-orange" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                      This Week ({thisWeekReminders.length})
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Upcoming (2–7 Days)
                  </span>
                </div>

                <div className="space-y-2">
                  {thisWeekReminders.map((rem) => (
                    <ReminderCard
                      key={rem.id}
                      reminder={rem}
                      onToggleComplete={dismissReminder}
                      onClickProduct={onSelectProduct}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 3. Later / Active Coverage Group */}
            {laterReminders.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-green" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                      Later & Active Coverage ({laterReminders.length})
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active & Safe
                  </span>
                </div>

                <div className="space-y-2">
                  {laterReminders.map((rem) => (
                    <ReminderCard
                      key={rem.id}
                      reminder={rem}
                      onToggleComplete={dismissReminder}
                      onClickProduct={onSelectProduct}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
