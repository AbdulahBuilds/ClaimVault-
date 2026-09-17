import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingBag, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  Store, 
  Tag, 
  Hash, 
  Info, 
  Check, 
  Zap, 
  CheckCircle2, 
  X,
  Camera,
  ScanLine,
  ArrowRight
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { ProductCategory, Product, Receipt } from '../types';
import { InputField } from '../components/ui/InputField';
import { SelectDropdown } from '../components/ui/SelectDropdown';
import { Button } from '../components/ui/Button';
import { ReceiptUploadBox } from '../components/forms/ReceiptUploadBox';
import { MobileHeader } from '../components/navigation/MobileHeader';
import { CATEGORIES } from '../constants/categories';
import { addDaysToDate, addMonthsToDate, calculateUrgency, getNow } from '../utils/dateUtils';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { getCurrencySymbol } from '../utils/currencyUtils';
import { ExtractedReceiptData } from '../services/aiScannerService';
import { triggerHaptic } from '../utils/haptics';

interface AddProductScreenProps {
  initialData?: Partial<ExtractedReceiptData> | null;
  onSuccess: (newProductId: string) => void;
  onCancel: () => void;
  onOpenAIScanner: () => void;
}

export const AddProductScreen: React.FC<AddProductScreenProps> = ({
  initialData,
  onSuccess,
  onCancel,
  onOpenAIScanner,
}) => {
  const { addProduct } = useProducts();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiPrefilled, setIsAiPrefilled] = useState(false);

  const currentCurrency = (initialData?.currency || user?.currency || 'PKR').toUpperCase();
  const currentSymbol = getCurrencySymbol(currentCurrency);

  const getTodayIso = () => {
    return getNow().toISOString().split('T')[0];
  };

  // Form State
  // Section 1: Product Information
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Electronics');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');

  // Section 2: Purchase Information
  const [purchaseDate, setPurchaseDate] = useState(getTodayIso());
  const [price, setPrice] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeLocation, setStoreLocation] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');

  // Section 3: Return Information
  const [hasReturnPeriod, setHasReturnPeriod] = useState(true);
  const [returnDays, setReturnDays] = useState('7');
  const [returnDeadline, setReturnDeadline] = useState('');

  // Section 4: Warranty Information
  const [warrantyMonths, setWarrantyMonths] = useState('12');
  const [warrantyDurationLabel, setWarrantyDurationLabel] = useState('1 Year');
  const [warrantyExpiryDate, setWarrantyExpiryDate] = useState('');
  const [warrantyType, setWarrantyType] = useState<'Manufacturer' | 'Extended' | 'Store'>('Manufacturer');
  const [warrantyProvider, setWarrantyProvider] = useState('');

  // Section 5: Receipt
  const [receipt, setReceipt] = useState<Receipt | undefined>(undefined);
  const [notes, setNotes] = useState('');

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate from initialData if provided from AI Scanner
  useEffect(() => {
    if (initialData) {
      if (initialData.name) setName(initialData.name);
      if (initialData.brand) setBrand(initialData.brand);
      if (initialData.model) setModel(initialData.model);
      if (initialData.category) setCategory(initialData.category);
      if (initialData.price !== undefined) setPrice(String(initialData.price));
      if (initialData.purchaseDate) setPurchaseDate(initialData.purchaseDate);
      if (initialData.storeName) setStoreName(initialData.storeName);
      if (initialData.storeLocation) setStoreLocation(initialData.storeLocation);
      if (initialData.invoiceNumber) setInvoiceNumber(initialData.invoiceNumber);
      if (initialData.hasReturnPeriod !== undefined) setHasReturnPeriod(initialData.hasReturnPeriod);
      if (initialData.returnDurationDays !== undefined) setReturnDays(String(initialData.returnDurationDays));
      if (initialData.returnDeadline) setReturnDeadline(initialData.returnDeadline);
      if (initialData.warrantyMonths !== undefined) setWarrantyMonths(String(initialData.warrantyMonths));
      if (initialData.warrantyDurationLabel) setWarrantyDurationLabel(initialData.warrantyDurationLabel);
      if (initialData.warrantyExpiryDate) setWarrantyExpiryDate(initialData.warrantyExpiryDate);
      if (initialData.warrantyType) setWarrantyType(initialData.warrantyType);
      if (initialData.warrantyProvider) setWarrantyProvider(initialData.warrantyProvider);
      if (initialData.notes) setNotes(initialData.notes);
      
      if (initialData.receiptImageUrl) {
        setReceipt({
          id: `rcpt-${Date.now()}`,
          fileName: initialData.receiptFileName || 'Scanned_Receipt.jpg',
          imageUrl: initialData.receiptImageUrl,
          uploadedAt: new Date().toISOString(),
          fileSize: '1.8 MB',
        });
      }

      setIsAiPrefilled(true);
      showToast('Form pre-filled with scanned receipt data!', 'success');
    }
  }, [initialData]);

  // Auto-calculate Return Deadline
  useEffect(() => {
    if (purchaseDate && hasReturnPeriod) {
      const days = parseInt(returnDays) || 0;
      setReturnDeadline(addDaysToDate(purchaseDate, days));
    }
  }, [purchaseDate, returnDays, hasReturnPeriod]);

  // Auto-calculate Warranty Expiry Date
  useEffect(() => {
    if (purchaseDate) {
      const months = parseInt(warrantyMonths) || 12;
      setWarrantyExpiryDate(addMonthsToDate(purchaseDate, months));
    }
  }, [purchaseDate, warrantyMonths]);

  const handleWarrantyMonthsChange = (months: string, label: string) => {
    setWarrantyMonths(months);
    setWarrantyDurationLabel(label);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Product name is required';
    if (!brand.trim()) errs.brand = 'Brand is required';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      errs.price = `Please enter a valid price in ${currentCurrency}`;
    }
    if (!storeName.trim()) errs.storeName = 'Store or seller name is required';
    if (!purchaseDate) errs.purchaseDate = 'Purchase date is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fix the errors before saving', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedPrice = parseFloat(price);
      const now = getNow();

      const newProductData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
        name: name.trim(),
        brand: brand.trim(),
        model: model.trim() || 'Standard Model',
        category,
        price: parsedPrice,
        currency: currentCurrency,
        purchaseDate,
        storeName: storeName.trim(),
        storeLocation: storeLocation.trim() || undefined,
        invoiceNumber: invoiceNumber.trim() || undefined,
        imageUrl: receipt?.imageUrl || undefined,
        receipt,
        warranty: {
          durationMonths: parseInt(warrantyMonths) || 12,
          durationLabel: warrantyDurationLabel,
          startDate: purchaseDate,
          expiryDate: warrantyExpiryDate,
          status: calculateUrgency(warrantyExpiryDate, now),
          warrantyType,
          providerName: warrantyProvider.trim() || `${brand || 'Manufacturer'} Care`,
        },
        returnInfo: {
          hasReturnPeriod,
          returnDurationDays: hasReturnPeriod ? parseInt(returnDays) || 0 : 0,
          returnDeadline: hasReturnPeriod ? returnDeadline : purchaseDate,
          status: hasReturnPeriod ? calculateUrgency(returnDeadline, now) : 'expired',
        },
        notes: notes.trim() || undefined,
      };

      const created = await addProduct(newProductData);
      onSuccess(created.id);
    } catch {
      showToast('Failed to save product. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full max-w-full flex flex-col bg-brand-bg overflow-hidden">
      {/* Header */}
      <div className="shrink-0 z-10">
        <MobileHeader
          title="Add Product"
          subtitle="Log purchase, receipt & warranties"
          showBack
          onBack={onCancel}
        />
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-5 pb-12 flex-1 w-full max-w-full overflow-y-auto no-scrollbar">
        {/* AI Prefill Highlight Banner if prefilled */}
        {isAiPrefilled && (
          <div className="p-3.5 rounded-2xl bg-teal-50 border border-brand-teal/40 flex items-center justify-between text-brand-navy shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-teal text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-teal-900">✨ AI Auto-Filled from Receipt</p>
                <p className="text-[10px] text-teal-700">All fields populated with high confidence. Review & save.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAiPrefilled(false)}
              className="p-1 rounded-lg text-teal-600 hover:text-teal-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Hero AI Scanner Trigger Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-brand-navy to-teal-950 border border-teal-500/40 shadow-float p-4 sm:p-5 text-white">
          {/* Ambient glowing radial lights */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-brand-teal/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-brand-navy/60 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-3.5">
            {/* Top Tag & Pulsing Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-teal/20 border border-brand-teal/40 text-teal-300 text-[10px] font-extrabold tracking-wider uppercase">
                <Sparkles className="w-3 h-3 text-teal-300 animate-pulse" />
                <span>AI Receipt Scanner</span>
              </div>
              <span className="text-[10px] font-extrabold text-white bg-brand-teal px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 text-yellow-300" />
                AI Powered
              </span>
            </div>

            {/* Main Headline & Description */}
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug">
                Scan Receipt to Auto-Fill
              </h3>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Take a photo or upload an invoice. AI scanner will automatically detect the product, price, warranty duration, and return window.
              </p>
            </div>

            {/* Feature Highlights Pills */}
            <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-200">
              <span className="bg-slate-800/80 border border-slate-700/80 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <Check className="w-2.5 h-2.5 text-teal-400" /> Neural Vision OCR
              </span>
              <span className="bg-slate-800/80 border border-slate-700/80 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <Check className="w-2.5 h-2.5 text-teal-400" /> Auto Deadlines
              </span>
              <span className="bg-slate-800/80 border border-slate-700/80 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <Check className="w-2.5 h-2.5 text-teal-400" /> Instant Pre-Fill
              </span>
            </div>

            {/* Main CTA Button */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                onOpenAIScanner();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-teal-600 via-brand-teal to-teal-600 hover:from-teal-500 hover:to-teal-600 text-white font-bold text-xs shadow-lg shadow-teal-950/40 flex items-center justify-center gap-2 transition active:scale-[0.98] border border-teal-400/40"
            >
              <Camera className="w-4 h-4 text-white shrink-0" />
              <span>Scan Receipt with AI</span>
              <ArrowRight className="w-3.5 h-3.5 text-white/80 shrink-0" />
            </button>
          </div>
        </div>

        {/* Divider: Or enter details manually */}
        <div className="relative flex items-center justify-center my-1">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-brand-bg px-3 text-[10px] uppercase font-extrabold tracking-wider text-brand-muted shrink-0">
            or enter details manually
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        {/* Section 1: Product Information */}
        <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-card space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-6 h-6 rounded-lg bg-brand-teal-subtle text-brand-teal flex items-center justify-center">
              <Package className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
              1. Product Information
            </h3>
          </div>

          <InputField
            label="Product Name"
            placeholder="e.g. Samsung Galaxy S24 Ultra"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
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
              placeholder="e.g. Samsung"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              error={errors.brand}
              required
            />
          </div>

          <InputField
            label="Model / Variant (Optional)"
            placeholder="e.g. 256GB Titanium Gray"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        </div>

        {/* Section 2: Purchase Information */}
        <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-card space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-6 h-6 rounded-lg bg-slate-100 text-brand-navy flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
              2. Purchase Information
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <InputField
              label="Purchase Date"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              error={errors.purchaseDate}
              required
            />

            <InputField
              label={`Purchase Price (${currentCurrency})`}
              type="number"
              prefixText={currentSymbol}
              placeholder="74999"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              error={errors.price}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <InputField
              label="Store / Seller"
              placeholder="e.g. ABC Electronics"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              error={errors.storeName}
              leftIcon={<Store className="w-4 h-4 text-brand-muted" />}
              required
            />

            <InputField
              label="Store City / Mall"
              placeholder="e.g. Lucky One, Karachi"
              value={storeLocation}
              onChange={(e) => setStoreLocation(e.target.value)}
            />
          </div>

          <InputField
            label="Invoice / Bill Number (Optional)"
            placeholder="e.g. INV-2026-98124"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            leftIcon={<Hash className="w-4 h-4 text-brand-muted" />}
          />
        </div>

        {/* Section 3: Return Information */}
        <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-card space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <RotateCcw className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                3. Return Information
              </h3>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-brand-navy">
              <input
                type="checkbox"
                checked={hasReturnPeriod}
                onChange={(e) => setHasReturnPeriod(e.target.checked)}
                className="w-4 h-4 rounded text-brand-teal focus:ring-brand-teal"
              />
              <span>Has Return Window</span>
            </label>
          </div>

          {hasReturnPeriod && (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-2.5">
                <SelectDropdown
                  label="Return Duration"
                  value={returnDays}
                  onChange={(e) => setReturnDays(e.target.value)}
                  options={(() => {
                    const base = [
                      { value: '3', label: '3 Days' },
                      { value: '7', label: '7 Days (Standard)' },
                      { value: '14', label: '14 Days' },
                      { value: '30', label: '30 Days' },
                    ];
                    return base.some((o) => o.value === returnDays)
                      ? base
                      : [{ value: returnDays, label: `${returnDays} Days` }, ...base];
                  })()}
                />

                <InputField
                  label="Calculated Deadline"
                  type="date"
                  value={returnDeadline}
                  onChange={(e) => setReturnDeadline(e.target.value)}
                  helperText="Automatic countdown target"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Warranty Information */}
        <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-card space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
              4. Warranty Information
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <SelectDropdown
              label="Warranty Duration"
              value={warrantyMonths}
              onChange={(e) => {
                const val = e.target.value;
                const labels: Record<string, string> = {
                  '1': '1 Month',
                  '3': '3 Months',
                  '6': '6 Months',
                  '12': '1 Year',
                  '24': '2 Years',
                  '36': '3 Years',
                  '60': '5 Years',
                  '120': '10 Years (Compressor)',
                };
                handleWarrantyMonthsChange(val, labels[val] || `${val} Months`);
              }}
              options={(() => {
                const base = [
                  { value: '1', label: '1 Month' },
                  { value: '3', label: '3 Months' },
                  { value: '6', label: '6 Months' },
                  { value: '12', label: '1 Year (Standard)' },
                  { value: '24', label: '2 Years' },
                  { value: '36', label: '3 Years' },
                  { value: '60', label: '5 Years' },
                  { value: '120', label: '10 Years (Compressor)' },
                ];
                return base.some((o) => o.value === warrantyMonths)
                  ? base
                  : [{ value: warrantyMonths, label: warrantyDurationLabel || `${warrantyMonths} Months` }, ...base];
              })()}
            />

            <InputField
              label="Warranty Expiry Date"
              type="date"
              value={warrantyExpiryDate}
              onChange={(e) => setWarrantyExpiryDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <SelectDropdown
              label="Warranty Type"
              value={warrantyType}
              onChange={(e) => setWarrantyType(e.target.value as any)}
              options={[
                { value: 'Manufacturer', label: 'Manufacturer' },
                { value: 'Extended', label: 'Extended' },
                { value: 'Store', label: 'Store / Checking' },
              ]}
            />

            <InputField
              label="Service Provider (Optional)"
              placeholder="e.g. Samsung Pakistan"
              value={warrantyProvider}
              onChange={(e) => setWarrantyProvider(e.target.value)}
            />
          </div>
        </div>

        {/* Section 5: Receipt Upload */}
        <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-card space-y-3.5">
          <ReceiptUploadBox receipt={receipt} onChange={setReceipt} />
        </div>

        {/* Primary Save Button */}
        <div className="pt-2 space-y-2">
          <Button
            type="submit"
            variant="action"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            leftIcon={<Check className="w-5 h-5" />}
          >
            Save Product
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="md"
            fullWidth
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
