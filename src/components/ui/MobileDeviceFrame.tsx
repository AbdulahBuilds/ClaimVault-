import React, { useState, ReactNode } from 'react';
import { Smartphone, Monitor, ShieldCheck, RefreshCw, Wifi, WifiOff, Sparkles } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { THEME } from '../../constants/theme';
import { triggerHaptic } from '../../utils/haptics';

interface MobileDeviceFrameProps {
  children: ReactNode;
}

type DevicePreset = 'iphone-se' | 'iphone-14' | 'pixel-pro' | 'fluid';

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({ children }) => {
  const [devicePreset, setDevicePreset] = useState<DevicePreset>('iphone-14');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const { restoreDefaults } = useProducts();

  const getDeviceWidthClass = () => {
    switch (devicePreset) {
      case 'iphone-se':
        return 'max-w-[375px] h-[100vh] sm:h-[760px] sm:max-h-[92vh] sm:rounded-[40px]';
      case 'iphone-14':
        return 'max-w-[393px] h-[100vh] sm:h-[830px] sm:max-h-[92vh] sm:rounded-[48px]';
      case 'pixel-pro':
        return 'max-w-[412px] h-[100vh] sm:h-[860px] sm:max-h-[94vh] sm:rounded-[44px]';
      case 'fluid':
        return 'max-w-md h-[100vh] sm:h-[830px] sm:max-h-[92vh] sm:rounded-2xl';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative font-sans select-none sm:p-2 md:p-4 overflow-hidden">
      {/* Ambient background glow */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Desktop Controls Bar */}
      <header className="w-full max-w-4xl hidden md:flex items-center justify-between py-2.5 px-5 mb-3 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 text-white z-50 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-teal to-teal-700 flex items-center justify-center shadow-glow-teal text-white">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">
                {THEME.app.name}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-teal/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Mobile Edition
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{THEME.app.tagline}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Online / Offline Simulator */}
          <button
            onClick={() => {
              setIsOnline(!isOnline);
              triggerHaptic('medium');
            }}
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
            }`}
            title="Toggle Network Simulation"
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Online' : 'Offline Mode'}</span>
          </button>

          {/* Reset Mock Data */}
          <button
            onClick={() => {
              restoreDefaults();
              triggerHaptic('success');
            }}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-800/80 transition active:scale-95"
            title="Reset Vault to Defaults"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Data</span>
          </button>

          {/* Viewport Presets Switcher */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => {
                setDevicePreset('iphone-se');
                triggerHaptic('selection');
              }}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition ${
                devicePreset === 'iphone-se'
                  ? 'bg-brand-teal text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Small Screen: iPhone SE (375px)"
            >
              SE (375px)
            </button>
            <button
              onClick={() => {
                setDevicePreset('iphone-14');
                triggerHaptic('selection');
              }}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition ${
                devicePreset === 'iphone-14'
                  ? 'bg-brand-teal text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Standard: iPhone 14/15 (393px)"
            >
              iPhone (393px)
            </button>
            <button
              onClick={() => {
                setDevicePreset('pixel-pro');
                triggerHaptic('selection');
              }}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition ${
                devicePreset === 'pixel-pro'
                  ? 'bg-brand-teal text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Large Screen: Pixel 7 / Max (412px)"
            >
              Pixel (412px)
            </button>
            <button
              onClick={() => {
                setDevicePreset('fluid');
                triggerHaptic('selection');
              }}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition ${
                devicePreset === 'fluid'
                  ? 'bg-brand-teal text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Full Responsive"
            >
              <Monitor className="w-3 h-3 inline mr-1" />
              Full
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Device Canvas */}
      <main
        className={`w-full transition-all duration-300 flex items-center justify-center ${getDeviceWidthClass()} ${
          devicePreset !== 'fluid'
            ? 'sm:p-2 sm:bg-slate-900 sm:border-[7px] sm:border-slate-800 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(15,139,141,0.15)] sm:ring-1 sm:ring-white/10'
            : 'sm:border sm:border-slate-800 sm:shadow-2xl'
        }`}
      >
        <div className="w-full h-full bg-brand-bg rounded-none sm:rounded-[36px] overflow-hidden flex flex-col relative shadow-inner">
          {/* Offline Notice Banner */}
          {!isOnline && (
            <div className="bg-amber-500 text-amber-950 px-3 py-1.5 text-[11px] font-bold flex items-center justify-between shadow-sm z-40 animate-fadeIn shrink-0">
              <div className="flex items-center gap-1.5">
                <WifiOff className="w-3.5 h-3.5 shrink-0" />
                <span>Working in Offline Mode — Changes saved locally</span>
              </div>
              <span className="text-[9px] uppercase px-1.5 py-0.5 bg-amber-600/30 rounded font-extrabold">
                Cached
              </span>
            </div>
          )}

          {/* Main App Screens Container */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
