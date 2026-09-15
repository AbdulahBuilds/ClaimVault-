import React from 'react';
import { Check, ChevronRight, Calendar } from 'lucide-react';
import { Reminder } from '../../types';
import { formatPKR } from '../../utils/currencyUtils';
import { formatDate } from '../../utils/dateUtils';
import { triggerHaptic } from '../../utils/haptics';

interface ReminderCardProps {
  reminder: Reminder;
  onToggleComplete: (reminderId: string) => void;
  onClickProduct: (productId: string) => void;
  className?: string;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  onToggleComplete,
  onClickProduct,
  className = '',
}) => {
  const isCompleted = reminder.isCompleted;
  const isReturn = reminder.type === 'return';
  const isExpired = reminder.urgency === 'expired';
  const isExpiring = reminder.urgency === 'expiring';

  const handleToggle = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    triggerHaptic(isCompleted ? 'light' : 'success');
    onToggleComplete(reminder.id);
  };

  const handleClickProduct = () => {
    triggerHaptic('light');
    onClickProduct(reminder.productId);
  };

  return (
    <div
      className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-3 w-full max-w-full overflow-hidden ${
        isCompleted
          ? 'bg-slate-50/80 border-slate-200 opacity-65'
          : isExpired
          ? 'bg-rose-50/70 border-rose-200/90 shadow-card hover:border-rose-300'
          : isExpiring
          ? 'bg-amber-50/60 border-amber-200/90 shadow-card hover:border-amber-300'
          : 'bg-white border-brand-border shadow-card hover:shadow-card-hover hover:border-teal-200'
      } ${className}`}
    >
      {/* Toggle Complete Checkbox */}
      <button
        type="button"
        onClick={handleToggle}
        className={`w-6 h-6 rounded-lg mt-0.5 flex items-center justify-center transition active:scale-90 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal ${
          isCompleted
            ? 'bg-brand-teal text-white shadow-sm'
            : isExpired
            ? 'border-2 border-rose-300 hover:border-rose-500 text-transparent hover:text-rose-500 bg-white'
            : isExpiring
            ? 'border-2 border-amber-300 hover:border-amber-500 text-transparent hover:text-amber-500 bg-white'
            : 'border-2 border-slate-300 hover:border-brand-teal text-transparent hover:text-brand-teal bg-white'
        }`}
        title={isCompleted ? 'Reactivate reminder' : 'Mark as completed'}
        aria-label={isCompleted ? 'Mark reminder incomplete' : 'Mark reminder complete'}
      >
        <Check className="w-3.5 h-3.5 stroke-[3]" />
      </button>

      {/* Main Content Area */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleClickProduct}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClickProduct();
          }
        }}
        className="flex-1 min-w-0 cursor-pointer focus:outline-none"
      >
        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          <span
            className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
              isReturn
                ? 'bg-amber-100 text-amber-900 border border-amber-200/60'
                : 'bg-teal-50 text-brand-teal border border-teal-200/60'
            }`}
          >
            {isReturn ? 'Return Deadline' : 'Warranty Alert'}
          </span>

          {reminder.ruleLabel && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                isExpired
                  ? 'bg-rose-100 text-rose-800'
                  : isExpiring
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {reminder.ruleLabel}
            </span>
          )}

          {isCompleted && (
            <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded-md">
              Completed
            </span>
          )}
        </div>

        {/* Reminder Title */}
        <h4
          className={`text-xs font-bold leading-snug tracking-tight truncate ${
            isCompleted
              ? 'line-through text-slate-400'
              : isExpired
              ? 'text-rose-900'
              : isExpiring
              ? 'text-amber-950'
              : 'text-brand-navy'
          }`}
        >
          {reminder.title}
        </h4>

        {/* Product Details & Price */}
        <div className="flex items-center gap-1.5 mt-1 text-xs">
          <span className="font-bold text-brand-navy truncate max-w-[130px]">
            {reminder.productName}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-brand-muted text-[11px] font-medium truncate max-w-[80px]">
            {reminder.brand}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-brand-teal font-extrabold text-xs shrink-0">
            {formatPKR(reminder.productPrice)}
          </span>
        </div>

        {/* Due Date & Subtitle */}
        <div className="flex items-center gap-1 mt-1 text-[11px] text-brand-muted">
          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">{formatDate(reminder.dueDate)}</span>
        </div>
      </div>

      {/* Chevron Link */}
      <button
        type="button"
        onClick={handleClickProduct}
        className="p-1 text-brand-muted hover:text-brand-navy transition self-center shrink-0 focus:outline-none"
        title="View Product"
        aria-label="View Product"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
