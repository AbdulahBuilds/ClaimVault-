import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, FileText, X } from 'lucide-react';

interface ReceiptOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onSelectGallery: () => void;
  onSelectSample: () => void;
  title?: string;
  subtitle?: string;
}

export const ReceiptOptionsModal: React.FC<ReceiptOptionsModalProps> = ({
  isOpen,
  onClose,
  onTakePhoto,
  onSelectGallery,
  onSelectSample,
  title = 'Attach Receipt',
  subtitle = 'Choose how you would like to add receipt proof',
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-float border border-brand-border flex flex-col"
        >
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <div>
              <h3 className="text-sm font-bold text-brand-navy">{title}</h3>
              <p className="text-[11px] text-brand-muted">{subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-brand-navy flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5 py-4">
            {/* Take Photo */}
            <button
              onClick={() => {
                onClose();
                onTakePhoto();
              }}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200 hover:border-brand-teal/40 transition active:scale-[0.98] text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-teal-subtle text-brand-teal flex items-center justify-center group-hover:scale-105 transition">
                <Camera className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-brand-navy">Take Photo</h4>
                <p className="text-[10px] text-brand-muted">Use device camera to snap receipt</p>
              </div>
            </button>

            {/* Choose from Gallery */}
            <button
              onClick={() => {
                onClose();
                onSelectGallery();
              }}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200 hover:border-brand-teal/40 transition active:scale-[0.98] text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-200 text-brand-navy flex items-center justify-center group-hover:scale-105 transition">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-brand-navy">Choose from Gallery / Files</h4>
                <p className="text-[10px] text-brand-muted">Upload image or document invoice</p>
              </div>
            </button>

            {/* Use Sample Invoice */}
            <button
              onClick={() => {
                onClose();
                onSelectSample();
              }}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200 hover:border-brand-teal/40 transition active:scale-[0.98] text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-brand-navy">Use Sample Tax Invoice</h4>
                <p className="text-[10px] text-brand-muted">Attach pre-formatted sample proof</p>
              </div>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-brand-border text-brand-navy text-xs font-bold hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
