import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, ChevronDown, Mail, MessageCircle, FileQuestion, ExternalLink } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: 'How do return deadline countdowns work?',
    a: 'When you log a purchase with a return policy (e.g. 7 or 14 days), ClaimVault automatically calculates the exact closing date and displays live daily countdown bars. You will receive notifications at 7 days, 3 days, 1 day before, and on the final day.',
  },
  {
    q: 'How do I claim a manufacturer warranty?',
    a: 'Open the product details screen in ClaimVault to access your official purchase date, serial number, invoice number, and digital receipt image. Show or share this proof to the service center or authorized retailer.',
  },
  {
    q: 'Where are my receipts stored?',
    a: 'Receipts are encrypted and stored securely in your vault, and synced across your authenticated devices.',
  },
  {
    q: 'Can I export my receipts and records?',
    a: 'Yes! Go to Profile > Privacy & Security to export a full JSON backup of all your purchases, warranties, and receipt documents.',
  },
];

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ isOpen, onClose }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  const handleContactSupport = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('support@claimvault.app');
    }
    showToast('Support email copied to clipboard: support@claimvault.app', 'info', 3000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-float border border-brand-border flex flex-col max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-brand-border shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-brand-teal flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-navy">Help & Support</h3>
                <p className="text-[11px] text-brand-muted">FAQs and Claim Assistance</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-brand-navy flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* FAQs Accordion */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy mb-1 flex items-center gap-1.5">
              <FileQuestion className="w-3.5 h-3.5 text-brand-teal" />
              <span>Frequently Asked Questions</span>
            </h4>

            {FAQS.map((faq, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50 overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(idx)}
                    className="w-full p-3 flex items-center justify-between text-left text-xs font-bold text-brand-navy gap-2 hover:bg-slate-100/70 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-brand-muted transition-transform shrink-0 ${
                        isExpanded ? 'rotate-180 text-brand-teal' : ''
                      }`}
                    />
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 text-[11px] text-brand-muted leading-relaxed border-t border-slate-200/60 pt-2 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Direct Contact Support Card */}
            <div className="mt-4 p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-brand-navy space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-teal" />
                <h4 className="text-xs font-bold">Need assistance with a claim?</h4>
              </div>
              <p className="text-[11px] text-brand-muted leading-snug">
                Our support team is available 24/7 to assist with warranty registrations and claim disputes.
              </p>
              <button
                type="button"
                onClick={handleContactSupport}
                className="w-full py-2 px-3 rounded-xl bg-brand-navy text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:bg-slate-800 transition active:scale-95"
              >
                <span>support@claimvault.app</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-brand-border text-brand-navy text-xs font-bold hover:bg-slate-50 transition shrink-0"
          >
            Close
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
