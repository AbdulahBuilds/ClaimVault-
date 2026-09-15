import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Camera, 
  FileText, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Clock, 
  CheckCircle2,
  Plus
} from 'lucide-react';
import { Button } from '../ui/Button';

interface AIScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated?: (newProductId: string) => void;
  onOpenInFullForm?: (extracted?: any) => void;
  onEnterManually?: () => void;
}

export const AIScannerModal: React.FC<AIScannerModalProps> = ({
  isOpen,
  onClose,
  onEnterManually,
}) => {
  if (!isOpen) return null;

  const handleManualEntry = () => {
    onClose();
    if (onEnterManually) {
      onEnterManually();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/85 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-float border border-brand-border flex flex-col overflow-hidden max-h-[92vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-navy via-slate-800 to-teal-900 text-white px-5 py-4 flex items-center justify-between shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/20 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center gap-2.5 relative z-10">
              <div className="w-9 h-9 rounded-2xl bg-brand-teal/20 border border-brand-teal/40 flex items-center justify-center text-brand-teal-light shadow-glow-teal">
                <Sparkles className="w-5 h-5 text-brand-teal-light animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-white">AI Receipt Scanner</h3>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                    Coming Soon
                  </span>
                </div>
                <p className="text-[11px] text-teal-200">Neural OCR & Document Vision</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition relative z-10 active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-5 overflow-y-auto text-center">
            {/* Visual Icon Presentation */}
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-brand-teal/20 to-amber-500/20 blur-lg animate-pulse" />
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-900 to-brand-navy text-white flex items-center justify-center border-2 border-brand-teal/40 shadow-xl relative">
                <Camera className="w-8 h-8 text-brand-teal-light" />
                <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center border-2 border-white shadow-md">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h4 className="text-base font-extrabold text-brand-navy">
                AI Receipt Scanning is Coming Soon!
              </h4>
              <p className="text-xs text-brand-muted leading-relaxed max-w-sm mx-auto">
                We are currently building and fine-tuning our high-precision Neural Vision AI to automatically extract product names, prices, warranty terms, and return deadlines from any invoice or receipt photo.
              </p>
            </div>

            {/* Feature Sneak Peek Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-left space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal block">
                What's coming in the AI update:
              </span>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0" />
                  <span>Instant OCR for digital & printed receipts</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0" />
                  <span>Auto-detect warranty duration & return deadlines</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0" />
                  <span>Pre-fills name, brand, store, price & invoice number</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2.5 pt-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleManualEntry}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Enter Product Details Manually
              </Button>

              <Button
                variant="ghost"
                size="md"
                fullWidth
                onClick={onClose}
                className="text-brand-muted hover:text-brand-navy text-xs"
              >
                Close & Return
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
