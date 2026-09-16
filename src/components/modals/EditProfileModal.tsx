import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Camera, Upload, Trash2, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { InputField } from '../ui/InputField';
import { Button } from '../ui/Button';

import { supabaseStorageService } from '../../services/supabaseStorageService';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || 'User');
  const [email, setEmail] = useState(user?.email || 'user@example.com');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatarUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const initialLetter = (name.trim() || user?.name || 'U').charAt(0).toUpperCase();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be under 5MB', 'error');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const publicUrl = await supabaseStorageService.uploadAvatar(file, user?.email || email || 'user');
      setAvatarUrl(publicUrl);
      showToast('Profile picture uploaded to cloud! Click Save Profile to apply.', 'success', 2500);
    } catch {
      showToast('Photo upload failed, please try again', 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showToast('Reset to initial letter', 'info', 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Name and email are required', 'error');
      return;
    }

    setIsSubmitting(true);
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      avatarUrl: avatarUrl || undefined,
    });
    setIsSubmitting(false);
    showToast('Profile updated successfully', 'success');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-float border border-brand-border flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-brand-teal flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-brand-navy">Edit Profile</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-brand-navy flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {/* Avatar & Upload Section */}
            <div className="flex flex-col items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />

              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-navy via-slate-800 to-teal-800 text-white flex items-center justify-center font-extrabold text-3xl shadow-card overflow-hidden border-2 border-brand-teal group-hover:scale-105 transition-transform duration-200">
                  {isUploadingPhoto ? (
                    <div className="w-full h-full flex items-center justify-center bg-brand-navy">
                      <div className="w-6 h-6 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{initialLetter}</span>
                  )}
                </div>

                <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-2xl bg-brand-teal text-white flex items-center justify-center border-2 border-white shadow-md group-hover:bg-brand-teal-dark transition">
                  <Camera className="w-4 h-4" />
                </div>
              </div>

              {/* Upload or Remove buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100/80 border border-teal-200 text-brand-teal text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100/80 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Use Initial</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-brand-muted text-center">
                {avatarUrl ? 'Custom profile photo uploaded' : `Displaying initial letter "${initialLetter}"`}
              </p>
            </div>

            {/* Inputs */}
            <InputField
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="w-4 h-4 text-brand-muted" />}
              required
            />

            <InputField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-brand-muted" />}
              required
            />

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <Button
                type="submit"
                variant="action"
                size="md"
                fullWidth
                isLoading={isSubmitting}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Save Profile
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                fullWidth
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
