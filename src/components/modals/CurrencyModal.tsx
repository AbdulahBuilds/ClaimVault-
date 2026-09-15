import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Coins } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  country: string;
}

const CURRENCIES: CurrencyOption[] = [
  { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs.', country: 'Pakistan (Default)' },
  { code: 'USD', name: 'US Dollar', symbol: '$', country: 'United States' },
  { code: 'EUR', name: 'Euro', symbol: '€', country: 'European Union' },
  { code: 'GBP', name: 'British Pound', symbol: '£', country: 'United Kingdom' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED', country: 'United Arab Emirates' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR', country: 'Saudi Arabia' },
];

export const CurrencyModal: React.FC<CurrencyModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const currentCurrency = user?.currency || 'PKR';

  const handleSelect = (code: string) => {
    updateProfile({ currency: code });
    showToast(`Currency updated to ${code}`, 'success');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-float border border-brand-border flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-brand-teal flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-navy">Display Currency</h3>
                <p className="text-[11px] text-brand-muted">Select your default pricing unit</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-brand-navy flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Currencies List */}
          <div className="divide-y divide-slate-100 py-3 max-h-[60vh] overflow-y-auto">
            {CURRENCIES.map((c) => {
              const isSelected = currentCurrency === c.code;
              return (
                <button
                  key={c.code}
                  onClick={() => handleSelect(c.code)}
                  className={`w-full py-3 px-3 flex items-center justify-between rounded-xl text-left transition ${
                    isSelected ? 'bg-teal-50/80 text-brand-navy font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-brand-navy">{c.code}</span>
                      <span className="text-xs font-extrabold text-brand-teal">({c.symbol})</span>
                    </div>
                    <p className="text-[11px] text-brand-muted">{c.name} • {c.country}</p>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-brand-teal text-white flex items-center justify-center shadow-sm">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-brand-border text-brand-navy text-xs font-bold hover:bg-slate-50 transition"
          >
            Close
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
