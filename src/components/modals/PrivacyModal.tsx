import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Download, 
  Upload, 
  RotateCcw, 
  KeyRound, 
  HardDrive,
  FileCheck,
  EyeOff,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { storageService } from '../../services/storageService';
import { Button } from '../ui/Button';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { products, restoreDefaults, clearAllProducts } = useProducts();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const usageStats = storageService.getStorageUsage(products);

  const handleExportJSON = () => {
    const backup = storageService.exportVaultData(products, user);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `claimvault_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Vault backup file exported successfully', 'success');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const userKey = user?.email ? user.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_') : undefined;
        const success = storageService.importVaultData(content, userKey);
        if (success) {
          showToast('Vault backup imported successfully. Reloading...', 'success');
          setTimeout(() => {
            window.location.reload();
          }, 800);
        } else {
          showToast('Invalid backup file format', 'error');
        }
      } catch {
        showToast('Failed to parse backup file', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    await restoreDefaults();
    setIsResetting(false);
    setShowResetConfirm(false);
    showToast('Sample products restored', 'info');
    onClose();
  };

  const handleConfirmClear = async () => {
    if (clearAllProducts) {
      await clearAllProducts();
    }
    setShowClearConfirm(false);
    showToast('Vault cleared completely', 'info');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-float border border-brand-border flex flex-col max-h-[88vh] overflow-hidden"
        >
          {/* Hidden File Input for Backup Import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleImportFile}
          />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-brand-border shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-brand-teal flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-navy">Privacy & Vault Storage</h3>
                <p className="text-[11px] text-brand-muted">Data protection & local encryption</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-brand-navy flex items-center justify-center transition active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-3.5 no-scrollbar">
            {/* Privacy & Security Guarantees Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-navy via-slate-900 to-teal-950 text-white space-y-3 shadow-sm border border-brand-teal/30">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand-teal-light" />
                <span className="text-xs font-bold text-white">Your Privacy Guarantee</span>
              </div>

              <div className="space-y-2 text-[11px] text-slate-200 leading-relaxed">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <span><strong>100% Private:</strong> Your receipts, purchase prices, and warranties are never shared or sold to advertisers.</span>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <span><strong>Encrypted Vault:</strong> Digital receipts and purchase records are isolated and protected securely on your device.</span>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <span><strong>Offline Access:</strong> All saved items, serial numbers, and deadline countdowns remain accessible without internet.</span>
                </div>
              </div>
            </div>

            {/* Storage Footprint & Usage Overview */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-brand-teal" />
                  <span className="text-xs font-bold text-brand-navy">Vault Storage Usage</span>
                </div>
                <span className="text-[10px] font-bold text-brand-teal bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                  Active Vault
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center py-2 bg-white rounded-xl border border-slate-200/70 shadow-sm">
                <div>
                  <span className="text-[10px] text-brand-muted block font-medium">Storage Size</span>
                  <span className="text-xs font-extrabold text-brand-navy">{usageStats.usedFormatted}</span>
                </div>
                <div>
                  <span className="text-[10px] text-brand-muted block font-medium">Saved Items</span>
                  <span className="text-xs font-extrabold text-brand-navy">{usageStats.productsCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-brand-muted block font-medium">Receipts</span>
                  <span className="text-xs font-extrabold text-brand-teal">{usageStats.receiptsCount}</span>
                </div>
              </div>
            </div>

            {/* Export Vault Backup */}
            <button
              type="button"
              onClick={handleExportJSON}
              className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50/60 border border-slate-200 text-left flex items-center justify-between transition active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-brand-teal flex items-center justify-center shadow-sm">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-navy">Export Vault Backup (JSON)</h4>
                  <p className="text-[10px] text-brand-muted">Download complete offline snapshot file</p>
                </div>
              </div>
            </button>

            {/* Import Vault Backup */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50/60 border border-slate-200 text-left flex items-center justify-between transition active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-brand-navy flex items-center justify-center shadow-sm">
                  <Upload className="w-4 h-4 text-brand-teal" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-navy">Import Vault Backup (JSON)</h4>
                  <p className="text-[10px] text-brand-muted">Restore products & receipts from backup</p>
                </div>
              </div>
            </button>

            {/* Load Sample Products */}
            {showResetConfirm ? (
              <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-2">
                <p className="text-xs font-bold text-brand-navy">Load fresh sample products into vault?</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => setShowResetConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="action"
                    size="sm"
                    fullWidth
                    isLoading={isResetting}
                    onClick={handleConfirmReset}
                  >
                    Load Samples
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50/60 border border-slate-200 text-left flex items-center justify-between transition active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-brand-teal flex items-center justify-center shadow-sm">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-navy">Load Sample Demo Items</h4>
                    <p className="text-[10px] text-brand-muted">Populate vault with demonstrative items</p>
                  </div>
                </div>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-brand-border text-brand-navy text-xs font-bold hover:bg-slate-50 transition shrink-0 mt-1"
          >
            Close
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
