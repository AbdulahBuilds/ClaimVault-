import React from 'react';
import { getDaysDifference, getNow, getTimelineProgress } from '../../utils/dateUtils';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CountdownBarProps {
  type: 'return' | 'warranty';
  startDate: string;
  endDate: string;
  targetDateLabel?: string;
  className?: string;
}

export const CountdownBar: React.FC<CountdownBarProps> = ({
  type,
  startDate,
  endDate,
  className = '',
}) => {
  const now = getNow();
  const daysRemaining = getDaysDifference(endDate, now);
  const progressPercent = getTimelineProgress(startDate, endDate, now);

  const isExpired = daysRemaining < 0;
  const isExpiringSoon = daysRemaining >= 0 && daysRemaining <= 30;
  const isSafe = daysRemaining > 30;

  let barColor = 'bg-brand-green';
  let badgeColor = 'text-brand-green bg-brand-green-subtle border-brand-green-light';
  let statusText = `${daysRemaining} days remaining`;

  if (isExpired) {
    barColor = 'bg-brand-red';
    badgeColor = 'text-brand-red bg-brand-red-subtle border-brand-red-light';
    statusText = 'Expired / Deadline Passed';
  } else if (isExpiringSoon) {
    barColor = type === 'return' ? 'bg-brand-orange' : 'bg-amber-500';
    badgeColor = 'text-amber-800 bg-amber-50 border-amber-200';
    if (daysRemaining === 0) {
      statusText = 'Ends Today!';
    } else if (daysRemaining === 1) {
      statusText = 'Ends Tomorrow!';
    } else {
      statusText = `${daysRemaining} days remaining`;
    }
  }

  return (
    <div className={`flex flex-col gap-2 p-3.5 rounded-xl border bg-slate-50/70 border-brand-border ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {isExpired ? (
            <AlertTriangle className="w-4 h-4 text-brand-red shrink-0" />
          ) : isExpiringSoon ? (
            <Clock className="w-4 h-4 text-brand-orange shrink-0 animate-pulse" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
          )}
          <span className="text-xs font-bold text-brand-navy">
            {type === 'return' ? 'Return Window' : 'Warranty Coverage'}
          </span>
        </div>

        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
          {statusText}
        </span>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden relative">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] font-medium text-brand-muted">
        <span>Started: {startDate || '—'}</span>
        <span>Deadline: {endDate || '—'}</span>
      </div>
    </div>
  );
};
