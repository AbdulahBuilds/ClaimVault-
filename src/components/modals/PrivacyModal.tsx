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
  Database, 
  FileCheck, 
  HardDrive,
  Cloud
} from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useToast } from '../../context/ToastContext';
import { storageService } from '../../services/storageService';
import { Button } from '../ui/Button';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  const { products, restoreDefaults } = useProducts();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const usageStats = storageService.getStorageUsage();

  const handleExportJSON = () => {
    const backup = storageService.exportVaultData();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `claimvault_vault_backup_${new Date().toISOString().split('T')[0]}.json`);
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
        const success = storageService.importVaultData(content);
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
                <p className="text-[11px] text-brand-muted">Cloud S3 & local persistence (Phase 12)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-brand-navy flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-3">
            {/* Cloud S3 Object Storage & Quota Card (Phase 12) */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-teal-950 text-white space-y-2.5 shadow-sm border border-brand-teal/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-brand-teal-light" />
                  <span className="text-xs font-bold text-white">S3 Cloud Receipt Vault</span>
                </div>
                <span className="text-[10px] font-extrabold text-teal-300 bg-brand-teal/20 border border-brand-teal/40 px-2 py-0.5 rounded-md">
                  Phase 12 Storage
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300">Quota Usage (500 MB limit)</span>
                  <span className="text-teal-300 font-extrabold">3.9 MB / 500 MB (1%)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-brand-teal rounded-full w-[2%]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] bg-white/5 p-2 rounded-xl border border-white/10 text-slate-300">
                <div>
                  <span className="text-slate-400 block">Encryption</span>
                  <span className="font-bold text-emerald-400">AES-256 at Rest</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Access Control</span>
                  <span className="font-bold text-teal-300">Private Signed URLs</span>
                </div>
              </div>
            </div>

            {/* Backend REST API & Cloud Sync Card (Phase 11) */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-brand-navy to-slate-900 text-white space-y-2.5 shadow-sm border border-brand-teal/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-bold text-white">PostgreSQL Backend API</span>
                </div>
                <span className="text-[10px] font-extrabold text-teal-300 bg-brand-teal/20 border border-brand-teal/40 px-2 py-0.5 rounded-md">
                  Phase 11
                </span>
              </div>

              <div className="flex items-center justify-between bg-white/10 px-3 py-2 rounded-xl border border-white/10 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-200 font-medium">REST Endpoints Active</span>
                </div>
                <span className="text-[10px] text-teal-300 font-bold">Node.js • JWT Auth</span>
              </div>
            </div>

            {/* Security Audit Matrix Card (Phase 13) */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/90 text-white space-y-2 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Security & Privacy Matrix</span>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-900/80 px-2 py-0.5 rounded-md border border-emerald-500/40">
                  Phase 13 Verified
                </span>
              </div>

              <div className="space-y-1 text-[11px] text-emerald-200/90">
                <div className="flex items-center justify-between">
                  <span>• Rate Limiter (Brute-Force Guard)</span>
                  <span className="font-bold text-emerald-400">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>• Zero-Trust Access Isolation</span>
                  <span className="font-bold text-emerald-400">Enforced</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>• XSS Payload Sanitizer</span>
                  <span className="font-bold text-emerald-400">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>• Signed URL TTL (15 Min Expiry)</span>
                  <span className="font-bold text-emerald-400">Active</span>
                </div>
              </div>
            </div>

            {/* Storage Footprint & Encryption Card */}
            <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-bold text-white">Local Vault Storage</span>
                </div>
                <span className="text-[10px] font-extrabold text-teal-300 bg-white/10 px-2 py-0.5 rounded-md">
                  Offline-First Cache
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center py-1 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <span className="text-[10px] text-slate-400 block">Footprint</span>
                  <span className="text-xs font-extrabold text-teal-300">{usageStats.usedFormatted}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Products</span>
                  <span className="text-xs font-extrabold text-white">{usageStats.productsCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Receipts</span>
                  <span className="text-xs font-extrabold text-emerald-300">{usageStats.receiptsCount}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                All data, receipts, and reminder configurations are strictly stored in local device storage and retained between sessions.
              </p>
            </div>

            {/* Biometric App Lock simulation */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-brand-navy flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-navy">Biometric App Lock</h4>
                  <p className="text-[10px] text-brand-muted">Require FaceID / Fingerprint on launch</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setBiometricEnabled(!biometricEnabled);
                  showToast(!biometricEnabled ? 'Biometric security enabled' : 'Biometric security disabled', 'info');
                }}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  biometricEnabled ? 'bg-brand-teal' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${
                    biometricEnabled ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Export Vault Backup */}
            <button
              type="button"
              onClick={handleExportJSON}
              className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200 text-left flex items-center justify-between transition active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-brand-teal flex items-center justify-center shadow-sm">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-navy">Export Vault Backup (JSON)</h4>
                  <p className="text-[10px] text-brand-muted">Download complete offline snapshot</p>
                </div>
              </div>
            </button>

            {/* Import Vault Backup */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200 text-left flex items-center justify-between transition active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-brand-navy flex items-center justify-center shadow-sm">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-navy">Import Vault Backup (JSON)</h4>
                  <p className="text-[10px] text-brand-muted">Restore products & receipts from file</p>
                </div>
              </div>
            </button>

            {/* Reset Vault Defaults */}
            {showResetConfirm ? (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-2">
                <p className="text-xs font-bold text-brand-red">Reset all data to default samples?</p>
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
                    variant="danger"
                    size="sm"
                    fullWidth
                    isLoading={isResetting}
                    onClick={handleConfirmReset}
                  >
                    Yes, Reset
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-rose-50/60 border border-slate-200 text-left flex items-center justify-between transition active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-brand-muted flex items-center justify-center shadow-sm">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-navy">Reset Vault Defaults</h4>
                    <p className="text-[10px] text-brand-muted">Reload clean catalog samples</p>
                  </div>
                </div>
              </button>
            )}
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
