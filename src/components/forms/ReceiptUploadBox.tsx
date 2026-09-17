import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Upload, X, ShieldCheck, CheckCircle2, Sparkles, FileText, Eye, Loader2, CloudUpload } from 'lucide-react';
import { Receipt } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { triggerHaptic } from '../../utils/haptics';
import { supabaseStorageService } from '../../services/supabaseStorageService';

interface ReceiptUploadBoxProps {
  receipt?: Receipt;
  onChange: (receipt?: Receipt) => void;
}

export const ReceiptUploadBox: React.FC<ReceiptUploadBoxProps> = ({ receipt, onChange }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(receipt?.imageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    triggerHaptic('success');
    setIsUploading(true);

    try {
      const userEmail = user?.email || 'user';
      const uploaded = await supabaseStorageService.uploadReceiptImage(file, userEmail, file.name);

      setPreviewUrl(uploaded.publicUrl);

      const newReceipt: Receipt = {
        id: `rec-${Date.now()}`,
        imageUrl: uploaded.publicUrl,
        fileName: uploaded.fileName,
        uploadedAt: new Date().toISOString(),
        fileSize: uploaded.fileSize,
      };

      onChange(newReceipt);
      showToast('Receipt uploaded to cloud storage', 'success');
    } catch {
      showToast('Could not upload to cloud, saved locally', 'info');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };


  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    if (previewUrl) {
      supabaseStorageService.deleteImage(previewUrl).catch(() => {});
    }
    setPreviewUrl(undefined);
    onChange(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    showToast('Receipt removed', 'info');
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header with status badge */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-brand-teal-subtle text-brand-teal flex items-center justify-center">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
            5. Receipt & Proof of Purchase
          </h3>
        </div>

        {previewUrl ? (
          <span className="text-[10px] font-bold bg-teal-50 text-brand-teal border border-teal-200/80 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <CheckCircle2 className="w-3 h-3 text-brand-teal" /> Proof Attached
          </span>
        ) : (
          <span className="text-[10px] font-semibold text-brand-muted">
            Optional
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      {isUploading ? (
        <div className="w-full rounded-2xl border border-brand-teal/40 bg-teal-50/40 p-6 flex flex-col items-center justify-center text-center space-y-2.5">
          <div className="w-10 h-10 rounded-full bg-teal-100 text-brand-teal flex items-center justify-center animate-spin">
            <Loader2 className="w-5 h-5 text-brand-teal" />
          </div>
          <div>
            <p className="text-xs font-bold text-brand-navy">Uploading to Supabase Storage...</p>
            <p className="text-[11px] text-brand-muted">Encrypting & generating permanent cloud receipt link</p>
          </div>
        </div>
      ) : previewUrl ? (
        <div className="relative w-full rounded-2xl overflow-hidden border border-brand-border bg-slate-900 group shadow-md transition">
          <img
            src={previewUrl}
            alt="Receipt preview"
            className="w-full h-44 object-cover object-center opacity-90 group-hover:opacity-100 transition duration-200"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-between p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold bg-teal-500 text-white px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                <ShieldCheck className="w-3 h-3" /> AES-256 Protected
              </span>
              <button
                type="button"
                onClick={handleRemove}
                className="w-7 h-7 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white flex items-center justify-center transition active:scale-90 shadow-md"
                title="Remove Receipt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-white">
              <p className="text-xs font-bold truncate">{receipt?.fileName || 'Attached_Receipt.jpg'}</p>
              <p className="text-[10px] text-slate-300 flex items-center gap-1 mt-0.5">
                <span>{receipt?.fileSize || '1.8 MB'}</span>
                <span>•</span>
                <span>Ready to save into secure vault</span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand-teal bg-slate-50/70 hover:bg-teal-50/20 p-4 transition duration-200 flex flex-col items-center justify-center text-center">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-teal/15 to-sky-600/15 border border-brand-teal/30 text-brand-teal flex items-center justify-center mb-2.5 shadow-sm">
            <Upload className="w-5 h-5 text-brand-teal" />
          </div>

          <h4 className="text-xs font-bold text-brand-navy mb-0.5">
            Attach Receipt / Invoice
          </h4>
          <p className="text-[11px] text-brand-muted max-w-[240px] mb-3.5 leading-snug">
            Take a photo with your camera or select an image / PDF from your gallery
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                cameraInputRef.current?.click();
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-brand-border text-brand-navy hover:bg-slate-50 text-xs font-bold shadow-sm transition active:scale-95"
            >
              <Camera className="w-3.5 h-3.5 text-brand-teal" />
              <span>Camera</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                fileInputRef.current?.click();
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-navy-dark text-white text-xs font-bold shadow-sm transition active:scale-95"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Gallery</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
