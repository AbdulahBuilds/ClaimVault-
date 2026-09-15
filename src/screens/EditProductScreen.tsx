import React, { useState } from 'react';
import { Package, ShoppingBag, RotateCcw, ShieldCheck, Check } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { ProductCategory, Product, Receipt } from '../types';
import { InputField } from '../components/ui/InputField';
import { SelectDropdown } from '../components/ui/SelectDropdown';
import { Button } from '../components/ui/Button';
import { ReceiptUploadBox } from '../components/forms/ReceiptUploadBox';
import { MobileHeader } from '../components/navigation/MobileHeader';
import { CATEGORIES } from '../constants/categories';
import { calculateUrgency, getNow } from '../utils/dateUtils';
import { useToast } from '../context/ToastContext';
import { triggerHaptic } from '../utils/haptics';

interface EditProductScreenProps {
  productId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditProductScreen: React.FC<EditProductScreenProps> = ({
  productId,
  onSuccess,
  onCancel,
}) => {
  const { getProductById, updateProduct } = useProducts();
  const product = getProductById(productId);
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State initialized from product
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState<ProductCategory>(product?.category || 'Electronics');
  const [brand, setBrand] = useState(product?.brand || '');
  const [model, setModel] = useState(product?.model || '');

  const [purchaseDate, setPurchaseDate] = useState(product?.purchaseDate || '');
  const [price, setPrice] = useState(product?.price ? String(product.price) : '');
  const [storeName, setStoreName] = useState(product?.storeName || '');
  const [storeLocation, setStoreLocation] = useState(product?.storeLocation || '');
  const [invoiceNumber, setInvoiceNumber] = useState(product?.invoiceNumber || '');

  const [hasReturnPeriod, setHasReturnPeriod] = useState(product?.returnInfo.hasReturnPeriod || false);
  const [returnDays, setReturnDays] = useState(product?.returnInfo.returnDurationDays ? String(product.returnInfo.returnDurationDays) : '7');
  const [returnDeadline, setReturnDeadline] = useState(product?.returnInfo.returnDeadline || '');

  const [warrantyDurationLabel, setWarrantyDurationLabel] = useState(product?.warranty.durationLabel || '1 Year');
  const [warrantyExpiryDate, setWarrantyExpiryDate] = useState(product?.warranty.expiryDate || '');
  const [warrantyProvider, setWarrantyProvider] = useState(product?.warranty.providerName || '');

  const [receipt, setReceipt] = useState<Receipt | undefined>(product?.receipt);
  const [notes, setNotes] = useState(product?.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!product) {
    return null;
  }

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Product name is required';
    if (!brand.trim()) errs.brand = 'Brand is required';
    if (!price || isNaN(Number(price))) errs.price = 'Valid price required';
    if (!storeName.trim()) errs.storeName = 'Store name is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const now = getNow();
      const updates: Partial<Product> = {
        name: name.trim(),
        brand: brand.trim(),
        model: model.trim(),
        category,
        price: parseFloat(price),
        purchaseDate,
        storeName: storeName.trim(),
        storeLocation: storeLocation.trim() || undefined,
        invoiceNumber: invoiceNumber.trim() || undefined,
        receipt,
        warranty: {
          ...product.warranty,
          durationLabel: warrantyDurationLabel,
          expiryDate: warrantyExpiryDate,
          providerName: warrantyProvider.trim(),
          status: calculateUrgency(warrantyExpiryDate, now),
        },
        returnInfo: {
          ...product.returnInfo,
          hasReturnPeriod,
          returnDurationDays: parseInt(returnDays) || 0,
          returnDeadline: hasReturnPeriod ? returnDeadline : purchaseDate,
          status: hasReturnPeriod ? calculateUrgency(returnDeadline, now) : 'expired',
        },
        notes: notes.trim() || undefined,
      };

      await updateProduct(product.id, updates);
      triggerHaptic('success');
      showToast('Product updated successfully', 'success');
      onSuccess();
    } catch {
      showToast('Failed to update product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full max-w-full flex flex-col bg-brand-bg overflow-hidden">
      {/* Header */}
      <div className="shrink-0 z-10">
        <MobileHeader
          title="Edit Product"
          subtitle={product.name}
          showBack
          onBack={onCancel}
        />
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4 pb-12 flex-1 w-full max-w-full overflow-y-auto no-scrollbar">
        {/* Section 1 */}
        <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-card space-y-3.5">
          <InputField
            label="Product Name"
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
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              error={errors.brand}
              required
            />
          </div>

          <InputField
            label="Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        </div>

        {/* Section 2 */}
        <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-card space-y-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <InputField
              label="Purchase Date"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
            />

            <InputField
              label="Price (PKR)"
              type="number"
              prefixText="Rs."
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              error={errors.price}
              required
            />
          </div>

          <InputField
            label="Store / Seller"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            error={errors.storeName}
            required
          />
        </div>

        {/* Section 3: Return & Warranty */}
        <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-card space-y-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <InputField
              label="Return Deadline"
              type="date"
              value={returnDeadline}
              onChange={(e) => setReturnDeadline(e.target.value)}
            />

            <InputField
              label="Warranty Expiry Date"
              type="date"
              value={warrantyExpiryDate}
              onChange={(e) => setWarrantyExpiryDate(e.target.value)}
            />
          </div>
        </div>

        {/* Section 4: Receipt */}
        <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-card">
          <ReceiptUploadBox receipt={receipt} onChange={setReceipt} />
        </div>

        {/* Action buttons */}
        <div className="pt-2 space-y-2">
          <Button
            type="submit"
            variant="action"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            leftIcon={<Check className="w-5 h-5" />}
          >
            Save Changes
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
