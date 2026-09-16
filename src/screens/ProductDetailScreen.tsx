import React, { useState, useRef } from 'react';
import { 
  Package, 
  ShoppingBag, 
  Store, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  RotateCcw, 
  Receipt as ReceiptIcon, 
  Edit3, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  FileText,
  AlertTriangle,
  Upload,
  RefreshCw,
  Plus,
  CheckCircle2
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { formatPKR } from '../utils/currencyUtils';
import { formatDate, formatRemainingTime, getDaysDifference, getNow } from '../utils/dateUtils';
import { Badge, CategoryBadge } from '../components/ui/Badge';
import { CountdownBar } from '../components/ui/CountdownBar';
import { Button } from '../components/ui/Button';
import { MobileHeader } from '../components/navigation/MobileHeader';
import { ReceiptViewerModal } from '../components/modals/ReceiptViewerModal';
import { DeleteConfirmModal } from '../components/modals/DeleteConfirmModal';
import { DeleteReceiptModal } from '../components/modals/DeleteReceiptModal';
import { ReceiptOptionsModal } from '../components/modals/ReceiptOptionsModal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Receipt } from '../types';
import { supabaseStorageService } from '../services/supabaseStorageService';

interface ProductDetailScreenProps {
  productId: string;
  onBack: () => void;
  onEdit: (productId: string) => void;
  onDeleted: () => void;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  productId,
  onBack,
  onEdit,
  onDeleted,
}) => {
  const { user } = useAuth();
  const { products, updateProduct, deleteProduct } = useProducts();
  const { showToast } = useToast();
  const product = products.find((p) => p.id === productId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isReceiptOptionsOpen, setIsReceiptOptionsOpen] = useState(false);
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);
  const [isDeleteReceiptModalOpen, setIsDeleteReceiptModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  if (!product) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-brand-bg">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-base font-bold text-brand-navy">Product Not Found</h2>
        <p className="text-xs text-brand-muted mt-1 max-w-xs">
          This product might have been deleted or moved.
        </p>
        <Button variant="primary" size="md" className="mt-4" onClick={onBack}>
          Back to Vault
        </Button>
      </div>
    );
  }

  const now = getNow();
  const daysWarrantyLeft = getDaysDifference(product.warranty.expiryDate, now);
  const daysReturnLeft = product.returnInfo.hasReturnPeriod 
    ? getDaysDifference(product.returnInfo.returnDeadline, now) 
    : -1;

  // Handle Product Deletion
  const handleDeleteProduct = async () => {
    setIsDeleting(true);
    const success = await deleteProduct(product.id);
    setIsDeleting(false);
    setIsDeleteProductModalOpen(false);
    if (success) {
      onDeleted();
    }
  };

  // Handle Real File Selection for Receipt
  const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingReceipt(true);
    showToast('Uploading receipt to Supabase Cloud Storage...', 'info');

    try {
      const userEmail = user?.email || 'user';
      const uploaded = await supabaseStorageService.uploadReceiptImage(file, userEmail, file.name);

      const newReceipt: Receipt = {
        id: `rec-${Date.now()}`,
        imageUrl: uploaded.publicUrl,
        fileName: uploaded.fileName,
        uploadedAt: new Date().toISOString(),
        fileSize: uploaded.fileSize,
      };

      await updateProduct(product.id, { receipt: newReceipt });
      showToast('Receipt saved to Supabase Cloud Storage', 'success');
    } catch {
      showToast('Failed to upload receipt', 'error');
    } finally {
      setIsUploadingReceipt(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  // Handle Sample Receipt Selection
  const handleSelectSampleReceipt = async () => {
    const newReceipt: Receipt = {
      id: `rec-${Date.now()}`,
      imageUrl: 'https://images.unsplash.com/photo-1554415707-9e4c018a482d?w=800&auto=format&fit=crop&q=80',
      fileName: 'Official_Store_Invoice.jpg',
      uploadedAt: new Date().toISOString(),
      fileSize: '1.6 MB',
    };

    try {
      await updateProduct(product.id, { receipt: newReceipt });
      showToast('Sample receipt attached successfully', 'success');
    } catch {
      showToast('Failed to attach sample receipt', 'error');
    }
  };

  // Handle Receipt Deletion from Product
  const handleConfirmDeleteReceipt = async () => {
    setIsDeleting(true);
    try {
      if (product.receipt?.imageUrl) {
        supabaseStorageService.deleteImage(product.receipt.imageUrl).catch(() => {});
      }
      await updateProduct(product.id, { receipt: undefined });
      showToast('Receipt removed from product', 'info');
      setIsDeleteReceiptModalOpen(false);
    } catch {
      showToast('Failed to remove receipt', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="h-full w-full max-w-full flex flex-col bg-brand-bg overflow-hidden">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleReceiptFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleReceiptFileChange}
      />

      {/* Navigation Header */}
      <div className="shrink-0 z-10">
        <MobileHeader
          title="Product Details"
          subtitle={product.brand}
          showBack
          onBack={onBack}
          rightAction={
            <button
              onClick={() => onEdit(product.id)}
              className="w-9 h-9 rounded-xl bg-white border border-brand-border flex items-center justify-center text-brand-navy hover:bg-slate-50 transition active:scale-95 shadow-sm"
              title="Edit Product"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          }
        />
      </div>

      <div className="p-4 space-y-4 pb-12 flex-1 w-full max-w-full overflow-y-auto no-scrollbar">
        {/* Product Hero Image & Header */}
        <div className="bg-white rounded-3xl p-5 border border-brand-border shadow-card flex flex-col items-center text-center">
          <div className="w-28 h-28 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200/80 mb-3.5 shadow-sm flex items-center justify-center">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-10 h-10 text-brand-navy" />
            )}
          </div>

          <div className="flex items-center gap-2 mb-1">
            <CategoryBadge label={product.category} />
            <span className="text-xs text-brand-muted font-medium">{product.brand}</span>
          </div>

          <h1 className="text-lg font-extrabold text-brand-navy tracking-tight max-w-xs">
            {product.name}
          </h1>

          <p className="text-xl font-extrabold text-brand-teal mt-1">
            {formatPKR(product.price)}
          </p>

          <div className="mt-3">
            <Badge status={product.warranty.status} size="md" />
          </div>
        </div>

        {/* Return Period Section with Visual Countdown */}
        {product.returnInfo.hasReturnPeriod && (
          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                  Return Period
                </h3>
              </div>

              {daysReturnLeft >= 0 ? (
                <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {daysReturnLeft === 0
                    ? 'Ends Today'
                    : daysReturnLeft === 1
                    ? '1 day remaining'
                    : `${daysReturnLeft} days remaining`}
                </span>
              ) : (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  Expired
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs py-1">
              <div>
                <span className="text-[11px] text-brand-muted block">Return Deadline</span>
                <span className="font-bold text-brand-navy">
                  {formatDate(product.returnInfo.returnDeadline)}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-brand-muted block">Window Length</span>
                <span className="font-bold text-brand-navy">
                  {product.returnInfo.returnDurationDays} Days Policy
                </span>
              </div>
            </div>

            {/* Visual Countdown Progress Bar */}
            <CountdownBar
              type="return"
              startDate={product.purchaseDate}
              endDate={product.returnInfo.returnDeadline}
            />

            {product.returnInfo.policyNotes && (
              <p className="text-[11px] text-brand-muted bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                ℹ️ {product.returnInfo.policyNotes}
              </p>
            )}
          </div>
        )}

        {/* Warranty Section */}
        <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                Warranty
              </h3>
            </div>

            <Badge status={product.warranty.status} size="sm" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs py-1">
            <div>
              <span className="text-[11px] text-brand-muted block">Warranty Duration</span>
              <span className="font-bold text-brand-navy">
                {product.warranty.durationLabel}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-brand-muted block">Expires On</span>
              <span className="font-bold text-brand-navy">
                {formatDate(product.warranty.expiryDate)}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-brand-muted block">Type</span>
              <span className="font-semibold text-brand-navy">
                {product.warranty.warrantyType} Warranty
              </span>
            </div>

            <div>
              <span className="text-[11px] text-brand-muted block">Provider</span>
              <span className="font-semibold text-brand-navy truncate block">
                {product.warranty.providerName || 'Manufacturer'}
              </span>
            </div>
          </div>

          <CountdownBar
            type="warranty"
            startDate={product.warranty.startDate || product.purchaseDate}
            endDate={product.warranty.expiryDate}
          />

          {product.warranty.notes && (
            <p className="text-[11px] text-brand-muted bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              📋 {product.warranty.notes}
            </p>
          )}
        </div>

        {/* Purchase Information */}
        <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-card space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-brand-navy flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
              Purchase Information
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs py-1">
            <div>
              <span className="text-[11px] text-brand-muted block">Purchase Date</span>
              <span className="font-bold text-brand-navy">
                {formatDate(product.purchaseDate)}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-brand-muted block">Price Paid</span>
              <span className="font-bold text-brand-teal">
                {formatPKR(product.price)}
              </span>
            </div>

            <div className="col-span-2">
              <span className="text-[11px] text-brand-muted block">Store / Seller</span>
              <span className="font-semibold text-brand-navy">
                {product.storeName}
                {product.storeLocation ? ` (${product.storeLocation})` : ''}
              </span>
            </div>

            {product.invoiceNumber && (
              <div className="col-span-2">
                <span className="text-[11px] text-brand-muted block">Invoice / Bill #</span>
                <span className="font-mono text-[11px] font-semibold text-brand-navy">
                  {product.invoiceNumber}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* PHASE 5: Receipt Management Section */}
        <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-card space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-brand-teal flex items-center justify-center">
                <ReceiptIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                  Digital Receipt & Proof
                </h3>
              </div>
            </div>

            {product.receipt ? (
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Attached
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Not Attached
              </span>
            )}
          </div>

          {product.receipt ? (
            <div className="space-y-3">
              {/* Receipt Preview Thumbnail with Inspect Trigger */}
              <div
                onClick={() => setIsReceiptOpen(true)}
                className="relative w-full h-36 rounded-2xl overflow-hidden border border-brand-border bg-slate-900 cursor-pointer group shadow-sm"
              >
                {product.receipt.imageUrl ? (
                  <img
                    src={product.receipt.imageUrl}
                    alt="Receipt preview"
                    className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition duration-200 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/80 p-4 font-mono text-xs">
                    <FileText className="w-6 h-6 mb-1 text-teal-400" />
                    <span>TAX INVOICE - {product.storeName}</span>
                    <span className="text-[10px] text-slate-400">Tap to inspect</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-between p-3.5 text-white">
                  <div className="text-[11px] min-w-0 pr-2">
                    <p className="font-bold truncate">{product.receipt.fileName || 'Official_Invoice.jpg'}</p>
                    <p className="text-[10px] text-slate-300">
                      {product.receipt.fileSize || '1.8 MB'} • Tap to enlarge
                    </p>
                  </div>
                  <span className="text-[10px] font-bold bg-white/20 hover:bg-white/30 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0">
                    <ExternalLink className="w-3 h-3" /> View
                  </span>
                </div>
              </div>

              {/* Required Phase 5 Actions: View Receipt, Replace Receipt, Delete Receipt */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ExternalLink className="w-3.5 h-3.5 text-brand-teal" />}
                  onClick={() => setIsReceiptOpen(true)}
                  className="w-full text-xs font-bold"
                >
                  View
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<RefreshCw className="w-3.5 h-3.5 text-brand-navy" />}
                  onClick={() => setIsReceiptOptionsOpen(true)}
                  className="w-full text-xs font-bold"
                >
                  Replace
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  onClick={() => setIsDeleteReceiptModalOpen(true)}
                  className="w-full text-xs font-bold"
                >
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            /* Empty State: Attach Receipt */
            <div className="w-full rounded-2xl border-2 border-dashed border-brand-border bg-slate-50/70 p-5 flex flex-col items-center justify-center text-center">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-brand-teal flex items-center justify-center mb-2.5 shadow-sm">
                <Upload className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-brand-navy mb-0.5">No Receipt Attached</h4>
              <p className="text-[11px] text-brand-muted max-w-[220px] mb-3.5">
                Attach proof of purchase to simplify warranty & return claims
              </p>

              <div className="flex items-center gap-2 w-full max-w-xs">
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setIsReceiptOptionsOpen(true)}
                >
                  Attach Receipt
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions: Edit & Delete Product */}
        <div className="pt-2 flex gap-2.5">
          <Button
            variant="outline"
            size="lg"
            leftIcon={<Edit3 className="w-4 h-4" />}
            onClick={() => onEdit(product.id)}
            className="flex-1"
          >
            Edit Product
          </Button>

          <Button
            variant="danger"
            size="lg"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={() => setIsDeleteProductModalOpen(true)}
            className="flex-1"
          >
            Delete Product
          </Button>
        </div>
      </div>

      {/* Full Screen Receipt Modal */}
      <ReceiptViewerModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        receipt={product.receipt}
        productName={product.name}
        onReplace={() => setIsReceiptOptionsOpen(true)}
        onDelete={() => setIsDeleteReceiptModalOpen(true)}
      />

      {/* Receipt Options Modal (Take Photo / Gallery / Sample) */}
      <ReceiptOptionsModal
        isOpen={isReceiptOptionsOpen}
        onClose={() => setIsReceiptOptionsOpen(false)}
        onTakePhoto={() => cameraInputRef.current?.click()}
        onSelectGallery={() => fileInputRef.current?.click()}
        onSelectSample={handleSelectSampleReceipt}
        title={product.receipt ? 'Replace Receipt' : 'Attach Receipt'}
        subtitle={`Select proof of purchase for ${product.name}`}
      />

      {/* Delete Receipt Confirmation Modal */}
      <DeleteReceiptModal
        isOpen={isDeleteReceiptModalOpen}
        onClose={() => setIsDeleteReceiptModalOpen(false)}
        onConfirm={handleConfirmDeleteReceipt}
        productName={product.name}
        isDeleting={isDeleting}
      />

      {/* Delete Product Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteProductModalOpen}
        onClose={() => setIsDeleteProductModalOpen(false)}
        onConfirm={handleDeleteProduct}
        productName={product.name}
        isDeleting={isDeleting}
      />
    </div>
  );
};
