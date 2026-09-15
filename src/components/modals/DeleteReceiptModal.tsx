import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, FileText, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface DeleteReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
  isDeleting?: boolean;
}

export const DeleteReceiptModal: React.FC<DeleteReceiptModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  productName,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-float border border-brand-border flex flex-col items-center text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <Trash2 className="w-7 h-7" />
          </div>

          <h3 className="text-base font-bold text-brand-navy mb-1.5">Remove Receipt Proof?</h3>
          <p className="text-xs text-brand-muted leading-relaxed mb-6">
            Are you sure you want to remove the digital receipt for <strong className="text-brand-navy">{productName}</strong>? 
            The product and warranty details will remain in your vault.
          </p>

          <div className="flex gap-2.5 w-full">
            <Button variant="outline" size="md" fullWidth onClick={onClose} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              fullWidth
              onClick={onConfirm}
              isLoading={isDeleting}
            >
              Remove Receipt
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
