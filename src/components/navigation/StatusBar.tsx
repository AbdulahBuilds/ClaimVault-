import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

export const StatusBar: React.FC = () => {
  return (
    <div className="w-full bg-transparent px-6 pt-3 pb-2 flex items-center justify-between text-brand-navy select-none shrink-0 z-40">
      {/* Time */}
      <span className="text-xs font-bold tracking-tight">9:41</span>

      {/* Dynamic Island / Speaker Pill */}
      <div className="w-20 h-4 bg-slate-900/90 rounded-full flex items-center justify-center gap-1.5 px-2 shadow-inner">
        <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
        <div className="w-2 h-2 rounded-full bg-slate-700" />
      </div>

      {/* Status Icons */}
      <div className="flex items-center gap-1.5 text-brand-navy">
        <Signal className="w-3.5 h-3.5" />
        <Wifi className="w-3.5 h-3.5" />
        <BatteryMedium className="w-4 h-4" />
      </div>
    </div>
  );
};
