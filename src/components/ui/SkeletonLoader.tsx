import React from 'react';

export const SkeletonLoader: React.FC<{ count?: number; className?: string }> = ({
  count = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-full bg-white rounded-2xl p-4 border border-brand-border/60 shadow-sm animate-pulse flex flex-col gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-200 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <div className="h-3 bg-slate-200 rounded w-20" />
            <div className="h-5 bg-slate-200 rounded-full w-24" />
          </div>
        </div>
      ))}
    </div>
  );
};
