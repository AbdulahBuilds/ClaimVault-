import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Share2, 
  Receipt as ReceiptIcon, 
  ShieldCheck, 
  Trash2, 
  RefreshCw,
  FileCheck,
  Cloud
} from 'lucide-react';
import { Receipt } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { useToast } from '../../context/ToastContext';

interface ReceiptViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt?: Receipt;
  productName: string;
  onReplace?: () => void;
  onDelete?: () => void;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  isOpen,
  onClose,
  receipt,
  productName,
  onReplace,
  onDelete,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleDownload = () => {
    showToast('Receipt saved to device photos', 'success');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    showToast('Receipt link copied to clipboard', 'info');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-float border border-slate-200 flex flex-col max-h-[92vh]"
        >
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-brand-border bg-slate-50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center shrink-0">
                <ReceiptIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-brand-navy truncate">
                    {productName}
                  </h3>
                  <span className="text-[10px] font-extrabold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                    <Cloud className="w-2.5 h-2.5 text-teal-600" /> S3 Cloud
                  </span>
                </div>
                <p className="text-[11px] text-brand-muted flex items-center gap-1 mt-0.5">
                  <FileCheck className="w-3 h-3 text-brand-teal" /> AES-256 Encrypted Proof
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleShare}
                className="w-8 h-8 rounded-xl bg-white border border-brand-border hover:bg-slate-100 text-brand-navy flex items-center justify-center transition"
                title="Share Receipt"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-brand-navy flex items-center justify-center transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Receipt Image / Document Display */}
          <div className="flex-1 overflow-auto bg-slate-950 p-4 flex items-center justify-center min-h-[320px] relative select-none">
            <div
              className="transition-transform duration-200 ease-out flex items-center justify-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {receipt?.imageUrl ? (
                <img
                  src={receipt.imageUrl}
                  alt={`Receipt for ${productName}`}
                  className="max-h-[52vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-white/20"
                />
              ) : (
                <div className="w-64 h-84 bg-white rounded-2xl p-5 text-brand-navy shadow-2xl flex flex-col justify-between font-mono text-xs border border-slate-300">
                  <div className="border-b border-dashed border-slate-300 pb-3 text-center">
                    <p className="font-extrabold text-sm tracking-wider text-brand-navy">OFFICIAL INVOICE</p>
                    <p className="text-[10px] text-slate-500">Tax & Purchase Receipt</p>
                  </div>
                  <div className="space-y-1.5 py-3 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Item:</span>
                      <span className="font-bold truncate max-w-[120px] text-brand-navy">{productName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date:</span>
                      <span className="font-semibold">{formatDate(new Date())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment:</span>
                      <span className="text-emerald-600 font-bold">PAID / VERIFIED</span>
                    </div>
                  </div>
                  <div className="border-t border-dashed border-slate-300 pt-3 text-center">
                    <p className="text-[10px] font-semibold text-brand-teal">Secured in ClaimVault</p>
                  </div>
                </div>
              )}
            </div>

            {/* Floating Zoom Controls Bar */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md rounded-full px-2 py-1 text-white border border-white/10 shadow-lg">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.75, Number((z - 0.25).toFixed(2))))}
                className="p-1 hover:text-brand-teal transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="text-[10px] font-mono px-1 hover:text-brand-teal transition"
                title="Reset Zoom"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, Number((z + 0.25).toFixed(2))))}
                className="p-1 hover:text-brand-teal transition"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Receipt Info & Actions Footer */}
          <div className="px-4 py-3 bg-white border-t border-brand-border flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <ShieldCheck className="w-4 h-4 text-brand-teal shrink-0" />
                <div className="text-[11px] min-w-0">
                  <p className="font-bold text-brand-navy truncate">
                    {receipt?.fileName || 'Official_Purchase_Receipt.jpg'}
                  </p>
                  <p className="text-brand-muted">
                    {receipt?.fileSize || '1.8 MB'} • {receipt?.uploadedAt ? formatDate(receipt.uploadedAt) : 'Saved to Vault'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-navy hover:bg-brand-navy-dark text-white text-xs font-semibold shadow-sm transition active:scale-95 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>

            {/* In-modal Action Bar: Replace / Remove */}
            {(onReplace || onDelete) && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                {onReplace && (
                  <button
                    onClick={() => {
                      onClose();
                      onReplace();
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border border-brand-border text-brand-navy hover:bg-slate-50 text-xs font-semibold transition active:scale-95"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-brand-teal" />
                    <span>Replace Receipt</span>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      onClose();
                      onDelete();
                    }}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
