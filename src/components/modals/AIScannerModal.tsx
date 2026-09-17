import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Camera, 
  Upload, 
  FileText, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  RotateCcw, 
  Store, 
  Calendar, 
  DollarSign, 
  Hash, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  Plus,
  ChevronRight,
  Eye,
  Check,
  Edit2,
  Tag
} from 'lucide-react';
import { Button } from '../ui/Button';
import { 
  aiScannerService, 
  ExtractedReceiptData 
} from '../../services/aiScannerService';
import { useProducts } from '../../context/ProductContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatPKR } from '../../utils/currencyUtils';
import { formatDate, calculateUrgency, getNow, addDaysToDate, addMonthsToDate } from '../../utils/dateUtils';
import { triggerHaptic } from '../../utils/haptics';
import { ProductCategory } from '../../types';

interface AIScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated?: (newProductId: string) => void;
  onOpenInFullForm?: (extracted: ExtractedReceiptData) => void;
  onEnterManually?: () => void;
}

type ModalView = 'choose' | 'scanning' | 'results';

function formatCurrencyAmount(price: number, currency?: string): string {
  return formatCurrency(price, currency);
}

export const AIScannerModal: React.FC<AIScannerModalProps> = ({
  isOpen,
  onClose,
  onProductCreated,
  onOpenInFullForm,
  onEnterManually,
}) => {
  const { addProduct } = useProducts();
  const { showToast } = useToast();

  const [view, setView] = useState<ModalView>('choose');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('Receipt_Scan.jpg');
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState('Initializing AI Scanner...');
  const [extractedData, setExtractedData] = useState<ExtractedReceiptData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingInline, setIsEditingInline] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setView('choose');
    setSelectedImage(null);
    setSelectedFileName('Receipt_Scan.jpg');
    setIsScanning(false);
    setScanProgress(0);
    setExtractedData(null);
    setIsEditingInline(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSelectedImage(result);
      setSelectedFileName(file.name);
      startScanProcess(result, file.name);
    };
    reader.readAsDataURL(file);
  };

  const startScanProcess = async (imageUrl: string, fileName: string) => {
    setView('scanning');
    setIsScanning(true);
    setScanProgress(20);
    setScanStep('Analyzing receipt image...');
    triggerHaptic('light');

    const p1 = setTimeout(() => {
      setScanProgress(55);
      setScanStep('Scanning receipt text, merchant, prices & date...');
    }, 600);

    const p2 = setTimeout(() => {
      setScanProgress(85);
      setScanStep('Parsing warranty terms, serials & return window...');
    }, 1200);

    try {
      const result = await aiScannerService.scanReceipt(imageUrl, fileName);
      clearTimeout(p1);
      clearTimeout(p2);
      setScanProgress(100);
      setScanStep('Receipt data successfully extracted!');
      setExtractedData(result);
      triggerHaptic('success');
      
      setTimeout(() => {
        setIsScanning(false);
        setView('results');
      }, 350);
    } catch (err: any) {
      clearTimeout(p1);
      clearTimeout(p2);
      setIsScanning(false);
      const message = err?.message || 'Could not recognize receipt details. Please try another image or enter manually.';
      showToast(message, 'error');
      setView('choose');
    }
  };

  const handleAutoFillForm = () => {
    if (!extractedData) return;
    triggerHaptic('medium');
    if (onOpenInFullForm) {
      onOpenInFullForm(extractedData);
    }
    handleClose();
  };

  const handleSaveDirectly = async () => {
    if (!extractedData) return;
    setIsSaving(true);
    triggerHaptic('medium');

    try {
      const now = getNow();
      const productPayload = {
        name: extractedData.name,
        category: extractedData.category,
        brand: extractedData.brand,
        model: extractedData.model || undefined,
        price: extractedData.price,
        currency: extractedData.currency || 'PKR',
        purchaseDate: extractedData.purchaseDate,
        storeName: extractedData.storeName,
        storeLocation: extractedData.storeLocation || undefined,
        invoiceNumber: extractedData.invoiceNumber || undefined,
        imageUrl: extractedData.receiptImageUrl || undefined,
        receipt: extractedData.receiptImageUrl ? {
          id: `rcpt-${Date.now()}`,
          fileName: extractedData.receiptFileName || 'Scanned_Receipt.jpg',
          imageUrl: extractedData.receiptImageUrl,
          uploadedAt: new Date().toISOString(),
          fileSize: '1.5 MB',
        } : undefined,
        warranty: {
          durationMonths: extractedData.warrantyMonths || 12,
          durationLabel: extractedData.warrantyDurationLabel || '1 Year',
          startDate: extractedData.purchaseDate,
          expiryDate: extractedData.warrantyExpiryDate,
          status: calculateUrgency(extractedData.warrantyExpiryDate, now),
          warrantyType: extractedData.warrantyType || 'Manufacturer',
          providerName: extractedData.warrantyProvider || `${extractedData.brand || 'Manufacturer'} Care`,
        },
        returnInfo: {
          hasReturnPeriod: extractedData.hasReturnPeriod,
          returnDurationDays: extractedData.returnDurationDays || 0,
          returnDeadline: extractedData.returnDeadline || extractedData.purchaseDate,
          status: extractedData.hasReturnPeriod ? calculateUrgency(extractedData.returnDeadline, now) : 'expired',
        },
        notes: extractedData.notes || 'Auto-extracted by AI Scanner.',
      };

      const created = await addProduct(productPayload);
      showToast('Receipt scanned & product saved to your vault!', 'success');
      triggerHaptic('success');
      
      handleClose();
      if (onProductCreated && created?.id) {
        onProductCreated(created.id);
      }
    } catch {
      showToast('Failed to save product', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: keyof ExtractedReceiptData, value: any) => {
    if (!extractedData) return;
    setExtractedData({
      ...extractedData,
      [field]: value,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-float border border-brand-border flex flex-col max-h-[92vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-teal to-teal-700 text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-navy flex items-center gap-1.5">
                  <span>AI Receipt Scanner</span>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-teal-100 text-brand-teal">
                    AI Powered
                  </span>
                </h3>
                <p className="text-[11px] text-brand-muted">
                  Auto-extract product, warranty & return window
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-brand-navy flex items-center justify-center transition active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* View 1: Choose Method (Upload / Camera) */}
          {view === 'choose' && (
            <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)] no-scrollbar">
              <div className="space-y-3.5">
                {/* Action 1: Camera Photo Capture */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('medium');
                    cameraInputRef.current?.click();
                  }}
                  className="w-full p-4 rounded-2xl bg-gradient-to-r from-brand-navy to-slate-800 text-white shadow-md hover:shadow-lg transition flex items-center justify-between border border-teal-500/30 group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3.5 text-left">
                    <div className="w-12 h-12 rounded-2xl bg-brand-teal/20 border border-brand-teal/40 flex items-center justify-center text-brand-teal-light group-hover:scale-105 transition">
                      <Camera className="w-6 h-6 text-teal-300" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">Take Photo with Camera</h4>
                      <p className="text-[11px] text-slate-300">Instant real-time receipt capture</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-teal-300 group-hover:translate-x-0.5 transition" />
                </button>

                {/* Action 2: Upload File / Drag & Drop Card */}
                <div
                  onClick={() => {
                    triggerHaptic('light');
                    fileInputRef.current?.click();
                  }}
                  className="p-5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-brand-teal bg-slate-50/70 hover:bg-teal-50/30 transition text-center cursor-pointer flex flex-col items-center justify-center gap-2 group active:scale-[0.99]"
                >
                  <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-brand-teal group-hover:scale-110 shadow-sm transition">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-navy">
                      Choose photo from gallery or file
                    </p>
                    <p className="text-[10px] text-brand-muted mt-0.5">
                      Supports JPG, PNG, WEBP, PDF invoices
                    </p>
                  </div>
                </div>

                {/* AI Capabilities Notice */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-teal flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Scanner Auto-Extracts:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-700 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                      <span>Product Name & Brand</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                      <span>Purchase Price & Store</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                      <span>Return Window Days</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                      <span>Warranty Expiry Date</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Manual Option */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    if (onEnterManually) onEnterManually();
                  }}
                  className="text-xs font-bold text-brand-teal hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Enter Details Manually</span>
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-xs font-medium text-brand-muted hover:text-brand-navy"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* View 2: Live AI Scanning Animation */}
          {view === 'scanning' && (
            <div className="p-6 space-y-6 text-center">
              {/* Receipt Preview with High-Tech Laser Beam Scanning Line */}
              <div className="relative mx-auto w-56 h-56 rounded-3xl bg-slate-900 border-2 border-brand-teal/50 overflow-hidden shadow-2xl flex items-center justify-center">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt="Scanning"
                    className="w-full h-full object-cover opacity-60"
                  />
                ) : (
                  <FileText className="w-16 h-16 text-slate-500" />
                )}

                {/* Animated Laser Scanning Line */}
                <motion.div
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] z-20"
                  animate={{
                    top: ['5%', '92%', '5%'],
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {/* Neural Target Overlay Rings */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-28 h-28 rounded-full border border-brand-teal/40 animate-ping" />
                  <div className="absolute w-16 h-16 rounded-full bg-brand-teal/20 backdrop-blur-xs flex items-center justify-center text-white">
                    <Sparkles className="w-7 h-7 text-cyan-300 animate-spin" />
                  </div>
                </div>
              </div>

              {/* Status & Progress Bar */}
              <div className="space-y-3 max-w-sm mx-auto">
                <div className="flex items-center justify-between text-xs font-bold text-brand-navy">
                  <span className="flex items-center gap-1.5 text-brand-teal">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing receipt image...</span>
                  </span>
                  <span>{scanProgress}%</span>
                </div>

                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <motion.div
                    className="h-full bg-gradient-to-r from-brand-teal to-emerald-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${scanProgress}%` }}
                    transition={{ ease: 'easeOut', duration: 0.3 }}
                  />
                </div>

                <p className="text-[11px] text-brand-muted h-5 truncate font-medium">
                  {scanStep}
                </p>
              </div>
            </div>
          )}

          {/* View 3: Structured Results & Verification */}
          {view === 'results' && extractedData && (
            <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)] no-scrollbar">
              {/* Verification Success Tag */}
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/90 flex items-center justify-between text-emerald-900">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">Extraction Complete</h4>
                    <p className="text-[10px] text-emerald-700">
                      Confidence: {Math.round(extractedData.confidenceScore * 100)}% • AI Verified
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingInline(!isEditingInline)}
                    className="text-[11px] font-bold text-brand-teal hover:underline flex items-center gap-1 bg-teal-50 px-2 py-1 rounded-lg border border-teal-200"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{isEditingInline ? 'Done Editing' : 'Edit Details'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Rescan</span>
                  </button>
                </div>
              </div>

              {/* Inline Quick Editor if toggled */}
              {isEditingInline && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                  <p className="font-bold text-brand-navy text-xs flex items-center gap-1">
                    <Edit2 className="w-3.5 h-3.5 text-brand-teal" />
                    <span>Quick Refine Scanned Fields</span>
                  </p>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-bold text-brand-muted uppercase">Product Name</label>
                      <input
                        type="text"
                        value={extractedData.name}
                        onChange={(e) => setExtractedData({ ...extractedData, name: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-brand-navy"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-brand-muted uppercase">Brand</label>
                        <input
                          type="text"
                          value={extractedData.brand}
                          onChange={(e) => setExtractedData({ ...extractedData, brand: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-brand-navy"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-brand-muted uppercase">Price ({extractedData.currency || 'PKR'})</label>
                        <input
                          type="number"
                          value={extractedData.price || ''}
                          onChange={(e) => setExtractedData({ ...extractedData, price: Number(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-brand-navy"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-brand-muted uppercase">Store</label>
                        <input
                          type="text"
                          value={extractedData.storeName}
                          onChange={(e) => setExtractedData({ ...extractedData, storeName: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-brand-navy"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-brand-muted uppercase">Purchase Date</label>
                        <input
                          type="date"
                          value={extractedData.purchaseDate}
                          onChange={(e) => {
                            const newDate = e.target.value;
                            const newDeadline = addDaysToDate(newDate, extractedData.returnDurationDays);
                            const newExpiry = addMonthsToDate(newDate, extractedData.warrantyMonths);
                            setExtractedData({ 
                              ...extractedData, 
                              purchaseDate: newDate,
                              returnDeadline: newDeadline,
                              warrantyExpiryDate: newExpiry
                            });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-brand-navy"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Extracted Details Card */}
              <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-card space-y-3.5">
                {/* Product Name & Brand */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal block">
                      {extractedData.category}
                    </span>
                    <h3 className="text-sm font-extrabold text-brand-navy mt-0.5">
                      {extractedData.name}
                    </h3>
                    <p className="text-[11px] text-brand-muted mt-0.5">
                      {extractedData.brand} {extractedData.model ? `• ${extractedData.model}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-brand-navy block">
                      {formatCurrencyAmount(extractedData.price, extractedData.currency)}
                    </span>
                    <span className="text-[10px] text-brand-muted">
                      {formatDate(extractedData.purchaseDate)}
                    </span>
                  </div>
                </div>

                {/* Grid of Key Info */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-brand-muted text-[10px] font-semibold">
                      <Store className="w-3 h-3 text-brand-navy" />
                      <span>Store / Merchant</span>
                    </div>
                    <p className="font-bold text-brand-navy mt-1 truncate">
                      {extractedData.storeName}
                    </p>
                    {extractedData.storeLocation && (
                      <p className="text-[10px] text-brand-muted truncate">
                        {extractedData.storeLocation}
                      </p>
                    )}
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-brand-muted text-[10px] font-semibold">
                      <Hash className="w-3 h-3 text-brand-navy" />
                      <span>Invoice / Bill #</span>
                    </div>
                    <p className="font-bold text-brand-navy mt-1 truncate font-mono text-[11px]">
                      {extractedData.invoiceNumber || 'INV-AUTO'}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-medium">Verified Slip</p>
                  </div>
                </div>

                {/* Return & Warranty Terms Highlight Banner */}
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-teal-50/80 border border-teal-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-brand-teal shrink-0" />
                      <div>
                        <span className="font-bold text-teal-950 block text-[11px]">
                          Warranty: {extractedData.warrantyDurationLabel}
                        </span>
                        <span className="text-[10px] text-teal-700">
                          Expires {formatDate(extractedData.warrantyExpiryDate)}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-teal-200/70 text-teal-900 px-2 py-0.5 rounded-md">
                      {extractedData.warrantyType}
                    </span>
                  </div>

                  {extractedData.hasReturnPeriod && (
                    <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 text-amber-700 shrink-0" />
                        <div>
                          <span className="font-bold text-amber-950 block text-[11px]">
                            Return Window: {extractedData.returnDurationDays} Days
                          </span>
                          <span className="text-[10px] text-amber-800">
                            Deadline: {formatDate(extractedData.returnDeadline)}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md">
                        Active
                      </span>
                    </div>
                  )}
                </div>

                {extractedData.notes && (
                  <p className="text-[10px] text-slate-500 italic bg-slate-50 p-2 rounded-lg">
                    "{extractedData.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleAutoFillForm}
                  leftIcon={<Sparkles className="w-4 h-4 text-yellow-300" />}
                >
                  Review & Auto-Fill in Add Form
                </Button>

                <Button
                  variant="action"
                  size="md"
                  fullWidth
                  onClick={handleSaveDirectly}
                  isLoading={isSaving}
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  Save Directly to Vault
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={handleReset}
                  className="text-brand-muted hover:text-brand-navy text-xs"
                >
                  Scan Another Receipt
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
