import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Camera, 
  Image as ImageIcon, 
  Check, 
  Zap, 
  ShieldCheck, 
  RotateCcw, 
  AlertTriangle, 
  Edit3, 
  Store, 
  Package, 
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  FileText
} from 'lucide-react';
import { Button } from '../ui/Button';
import { InputField } from '../ui/InputField';
import { SelectDropdown } from '../ui/SelectDropdown';
import { CATEGORIES } from '../../constants/categories';
import { 
  aiScannerService, 
  ExtractedReceiptData, 
  SAMPLE_RECEIPT_PRESETS 
} from '../../services/aiScannerService';
import { ProductCategory, Product, Receipt } from '../../types';
import { useProducts } from '../../context/ProductContext';
import { useToast } from '../../context/ToastContext';
import { formatPKR } from '../../utils/currencyUtils';
import { addDaysToDate, addMonthsToDate, calculateUrgency, getNow } from '../../utils/dateUtils';

interface AIScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated?: (newProductId: string) => void;
  onOpenInFullForm?: (extracted: ExtractedReceiptData) => void;
}

type ScanStep = 'select' | 'scanning' | 'review' | 'failed';

export const AIScannerModal: React.FC<AIScannerModalProps> = ({
  isOpen,
  onClose,
  onProductCreated,
  onOpenInFullForm,
}) => {
  const { addProduct } = useProducts();
  const { showToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<ScanStep>('select');
  const [scanProgressText, setScanProgressText] = useState('Reading document image...');
  const [selectedReceiptImage, setSelectedReceiptImage] = useState<string>('');
  const [selectedFileName, setSelectedFileName] = useState<string>('Receipt_Invoice.jpg');
  const [isSaving, setIsSaving] = useState(false);

  // Extracted Data Editable Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Electronics');
  const [price, setPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeLocation, setStoreLocation] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [returnDays, setReturnDays] = useState('7');
  const [returnDeadline, setReturnDeadline] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState('12');
  const [warrantyDurationLabel, setWarrantyDurationLabel] = useState('1 Year');
  const [warrantyExpiryDate, setWarrantyExpiryDate] = useState('');
  const [warrantyType, setWarrantyType] = useState<'Manufacturer' | 'Extended' | 'Store'>('Manufacturer');
  const [warrantyProvider, setWarrantyProvider] = useState('');
  const [confidenceScore, setConfidenceScore] = useState(0.98);

  if (!isOpen) return null;

  const handleReset = () => {
    setStep('select');
    setSelectedReceiptImage('');
    setSelectedFileName('Receipt_Invoice.jpg');
  };

  const handleStartScan = async (imageUrl: string, fileName: string, presetId?: string) => {
    setSelectedReceiptImage(imageUrl);
    setSelectedFileName(fileName);
    setStep('scanning');

    // Progressive status updates
    setScanProgressText('Scanning document image & cropping boundaries...');
    setTimeout(() => {
      setScanProgressText('Detecting merchant, dates & prices with Neural OCR...');
    }, 600);
    setTimeout(() => {
      setScanProgressText('Extracting warranty & return policy with AI...');
    }, 1200);

    try {
      const extracted = await aiScannerService.scanReceipt(imageUrl, fileName, presetId);

      // Populate editable fields
      setName(extracted.name);
      setBrand(extracted.brand);
      setModel(extracted.model);
      setCategory(extracted.category);
      setPrice(String(extracted.price));
      setPurchaseDate(extracted.purchaseDate);
      setStoreName(extracted.storeName);
      setStoreLocation(extracted.storeLocation || '');
      setInvoiceNumber(extracted.invoiceNumber || '');
      setReturnDays(String(extracted.returnDurationDays));
      setReturnDeadline(extracted.returnDeadline);
      setWarrantyMonths(String(extracted.warrantyMonths));
      setWarrantyDurationLabel(extracted.warrantyDurationLabel);
      setWarrantyExpiryDate(extracted.warrantyExpiryDate);
      setWarrantyType(extracted.warrantyType);
      setWarrantyProvider(extracted.warrantyProvider || '');
      setConfidenceScore(extracted.confidenceScore);

      setStep('review');
      showToast('Receipt scanned & extracted successfully!', 'success');
    } catch {
      setStep('failed');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    handleStartScan(objectUrl, file.name);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSaveToVault = async () => {
    if (!name.trim() || !brand.trim() || !price || !storeName.trim()) {
      showToast('Please fill all required extracted fields', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const now = getNow();
      const pDate = purchaseDate || now.toISOString().split('T')[0];
      const rDeadline = returnDeadline || addDaysToDate(pDate, parseInt(returnDays) || 7);
      const wExpiry = warrantyExpiryDate || addMonthsToDate(pDate, parseInt(warrantyMonths) || 12);

      const attachedReceipt: Receipt = {
        id: `rec-${Date.now()}`,
        imageUrl: selectedReceiptImage || 'https://images.unsplash.com/photo-1554415707-9e4c018a482d?w=800&auto=format&fit=crop&q=80',
        fileName: selectedFileName,
        uploadedAt: new Date().toISOString(),
        fileSize: '1.8 MB',
      };

      const newProductData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
        name: name.trim(),
        brand: brand.trim(),
        model: model.trim() || 'Standard Edition',
        category,
        price: parseFloat(price) || 0,
        currency: 'PKR',
        purchaseDate: pDate,
        storeName: storeName.trim(),
        storeLocation: storeLocation.trim() || undefined,
        invoiceNumber: invoiceNumber.trim() || undefined,
        receipt: attachedReceipt,
        warranty: {
          durationMonths: parseInt(warrantyMonths) || 12,
          durationLabel: warrantyDurationLabel || '1 Year',
          startDate: pDate,
          expiryDate: wExpiry,
          status: calculateUrgency(wExpiry, now),
          warrantyType,
          providerName: warrantyProvider.trim() || undefined,
        },
        returnInfo: {
          hasReturnPeriod: parseInt(returnDays) > 0,
          returnDurationDays: parseInt(returnDays) || 0,
          returnDeadline: rDeadline,
          status: calculateUrgency(rDeadline, now),
        },
      };

      const created = await addProduct(newProductData);
      showToast('Product verified and added to ClaimVault!', 'success');
      onClose();
      handleReset();
      if (onProductCreated) {
        onProductCreated(created.id);
      }
    } catch {
      showToast('Failed to save scanned product', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenInEditor = () => {
    const extractedData: ExtractedReceiptData = {
      name,
      brand,
      model,
      category,
      price: parseFloat(price) || 0,
      currency: 'PKR',
      purchaseDate,
      storeName,
      storeLocation,
      invoiceNumber,
      returnDurationDays: parseInt(returnDays) || 7,
      hasReturnPeriod: parseInt(returnDays) > 0,
      returnDeadline,
      warrantyMonths: parseInt(warrantyMonths) || 12,
      warrantyDurationLabel,
      warrantyExpiryDate,
      warrantyType,
      warrantyProvider,
      receiptImageUrl: selectedReceiptImage,
      receiptFileName: selectedFileName,
      confidenceScore,
    };

    onClose();
    handleReset();
    if (onOpenInFullForm) {
      onOpenInFullForm(extractedData);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/85 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-float border border-brand-border flex flex-col max-h-[92vh] overflow-hidden"
        >
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

          {/* Modal Header */}
          <div className="bg-gradient-to-r from-brand-navy via-slate-800 to-teal-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-brand-teal/20 border border-brand-teal/40 flex items-center justify-center text-brand-teal-light shadow-glow-teal">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">AI Receipt Scanner</h3>
                <p className="text-[11px] text-teal-200">
                  {step === 'select'
                    ? 'Snap or pick a purchase proof'
                    : step === 'scanning'
                    ? 'Processing receipt...'
                    : step === 'review'
                    ? 'Review Information'
                    : 'Extraction issue'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* STEP 1: Select / Capture Receipt */}
          {step === 'select' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Camera & Gallery Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-4 rounded-2xl bg-teal-50 hover:bg-teal-100/70 border border-teal-200 text-brand-navy flex flex-col items-center justify-center text-center gap-2 transition active:scale-95 shadow-sm group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-teal text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-navy">Take Photo</h4>
                    <p className="text-[10px] text-brand-muted">Use device camera</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-brand-navy flex flex-col items-center justify-center text-center gap-2 transition active:scale-95 shadow-sm group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-navy text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-navy">From Gallery</h4>
                    <p className="text-[10px] text-brand-muted">Image or PDF invoice</p>
                  </div>
                </button>
              </div>

              {/* Sample Preset Receipts */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                    Or Try Sample Pakistani Invoices
                  </h4>
                  <span className="text-[10px] text-brand-teal font-semibold">1-Tap AI Demo</span>
                </div>

                <div className="space-y-2">
                  {SAMPLE_RECEIPT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleStartScan(preset.imageUrl, `${preset.id}_receipt.jpg`, preset.id)}
                      className="w-full p-3 rounded-2xl bg-white hover:bg-teal-50/50 border border-slate-200/90 hover:border-brand-teal text-left flex items-center justify-between transition active:scale-[0.98] shadow-sm group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-brand-navy flex items-center justify-center shrink-0 group-hover:bg-brand-teal group-hover:text-white transition">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-brand-navy truncate">
                            {preset.data.name}
                          </h5>
                          <p className="text-[10px] text-brand-muted truncate">
                            {preset.merchant} • {formatPKR(preset.price)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-brand-teal text-xs font-bold shrink-0">
                        <span>Scan</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Active Scanning & Laser Animation */}
          {step === 'scanning' && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[340px] bg-slate-900 text-white relative overflow-hidden">
              {/* Scanning Container */}
              <div className="relative w-56 h-64 rounded-2xl overflow-hidden border-2 border-brand-teal/80 shadow-2xl bg-slate-950 mb-5">
                <img
                  src={selectedReceiptImage || 'https://images.unsplash.com/photo-1554415707-9e4c018a482d?w=800&auto=format&fit=crop&q=80'}
                  alt="Scanning"
                  className="w-full h-full object-cover opacity-70"
                />

                {/* Laser scan line */}
                <motion.div
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-teal-300 via-teal-100 to-teal-300 shadow-[0_0_15px_#0F8B8D] z-10"
                  animate={{ top: ['5%', '92%', '5%'] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Shimmer Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-teal-900/30 via-transparent to-teal-900/30 pointer-events-none" />
              </div>

              {/* Progress Text */}
              <div className="space-y-1.5 max-w-xs">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
                  <span className="text-xs font-bold text-teal-300">Processing receipt...</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">{scanProgressText}</p>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="mt-6 text-xs text-slate-400 hover:text-white underline"
              >
                Cancel scan
              </button>
            </div>
          )}

          {/* STEP 3: Review Information Screen */}
          {step === 'review' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Confidence Callout */}
              <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-teal" />
                  <span className="font-bold text-brand-navy">
                    AI Extraction ({Math.round(confidenceScore * 100)}% Confidence)
                  </span>
                </div>
                <span className="text-[10px] text-brand-teal font-extrabold bg-white px-2 py-0.5 rounded-md border border-teal-200">
                  Review & Verify
                </span>
              </div>

              <p className="text-[11px] text-brand-muted leading-tight">
                Review and modify any extracted fields below before adding this product to your ClaimVault vault.
              </p>

              {/* Editable Extracted Form */}
              <div className="space-y-3 bg-white">
                <InputField
                  label="Product Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  leftIcon={<Package className="w-4 h-4 text-brand-muted" />}
                  required
                />

                <div className="grid grid-cols-2 gap-2.5">
                  <SelectDropdown
                    label="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    options={CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
                  />

                  <InputField
                    label="Brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <InputField
                    label="Price (PKR)"
                    type="number"
                    prefixText="Rs."
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />

                  <InputField
                    label="Purchase Date"
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <InputField
                    label="Store / Seller"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    leftIcon={<Store className="w-4 h-4 text-brand-muted" />}
                    required
                  />

                  <InputField
                    label="Invoice #"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                  />
                </div>

                {/* Return & Warranty Breakdown */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <InputField
                      label="Return Window (Days)"
                      type="number"
                      value={returnDays}
                      onChange={(e) => {
                        setReturnDays(e.target.value);
                        if (purchaseDate) {
                          setReturnDeadline(addDaysToDate(purchaseDate, parseInt(e.target.value) || 0));
                        }
                      }}
                    />

                    <InputField
                      label="Return Deadline"
                      type="date"
                      value={returnDeadline}
                      onChange={(e) => setReturnDeadline(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <InputField
                      label="Warranty Duration"
                      value={warrantyDurationLabel}
                      onChange={(e) => setWarrantyDurationLabel(e.target.value)}
                    />

                    <InputField
                      label="Warranty Expiry"
                      type="date"
                      value={warrantyExpiryDate}
                      onChange={(e) => setWarrantyExpiryDate(e.target.value)}
                    />
                  </div>

                  <InputField
                    label="Warranty Provider"
                    value={warrantyProvider}
                    onChange={(e) => setWarrantyProvider(e.target.value)}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <Button
                  variant="action"
                  size="lg"
                  fullWidth
                  onClick={handleSaveToVault}
                  isLoading={isSaving}
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  Save to Vault Directly
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="md"
                    className="flex-1"
                    onClick={handleOpenInEditor}
                    leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                  >
                    Open in Full Form
                  </Button>

                  <Button
                    variant="ghost"
                    size="md"
                    className="flex-1 text-brand-muted"
                    onClick={handleReset}
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  >
                    Rescan
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Extraction Failed */}
          {step === 'failed' && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-brand-red flex items-center justify-center">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-base font-bold text-brand-navy mb-1">
                  Couldn't read this receipt
                </h3>
                <p className="text-xs text-brand-muted max-w-xs leading-relaxed">
                  The image might be blurry or poorly lit. You can retake the photo or enter the product details manually.
                </p>
              </div>

              <div className="flex flex-col gap-2 w-full max-w-xs pt-2">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={handleReset}
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  Try Another Photo
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={() => {
                    onClose();
                    handleReset();
                  }}
                >
                  Enter Manually
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
