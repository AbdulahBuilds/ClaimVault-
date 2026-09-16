import { getSupabaseClient } from './supabaseClient';

export const RECEIPT_BUCKET = 'claimvault-receipts';

export class SupabaseStorageService {
  /**
   * Converts a File or Blob to a Base64 string fallback
   */
  public async fileToBase64(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Converts a Base64 string to a Blob for uploading
   */
  public base64ToBlob(base64Data: string): Blob {
    const arr = base64Data.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  /**
   * Upload a receipt picture or document to Supabase Storage
   * Returns the permanent public CDN URL
   */
  public async uploadReceiptImage(
    file: File | Blob,
    userEmail: string,
    originalName?: string
  ): Promise<{ publicUrl: string; fileName: string; fileSize: string }> {
    const rawFileName = originalName || (file instanceof File ? file.name : `receipt_${Date.now()}.jpg`);
    const cleanFileName = rawFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileSizeStr = `${((file.size || 1024 * 1024) / (1024 * 1024)).toFixed(1)} MB`;

    const supabase = getSupabaseClient();
    const normalizedEmail = (userEmail || 'anonymous').trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    const filePath = `receipts/${normalizedEmail}/${Date.now()}_${cleanFileName}`;

    if (supabase) {
      try {
        const { data, error } = await supabase.storage
          .from(RECEIPT_BUCKET)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type || 'image/jpeg',
          });

        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from(RECEIPT_BUCKET)
            .getPublicUrl(filePath);

          if (urlData?.publicUrl) {
            return {
              publicUrl: urlData.publicUrl,
              fileName: rawFileName,
              fileSize: fileSizeStr,
            };
          }
        } else if (error) {
          console.warn('[SupabaseStorage] Upload notice (bucket may need creation):', error.message);
        }
      } catch (err) {
        console.warn('[SupabaseStorage] Unexpected upload error:', err);
      }
    }

    // Offline / Local Fallback: Convert to Base64 so it persists locally
    try {
      const base64Url = await this.fileToBase64(file);
      return {
        publicUrl: base64Url,
        fileName: rawFileName,
        fileSize: fileSizeStr,
      };
    } catch {
      // In-memory fallback
      const objectUrl = URL.createObjectURL(file);
      return {
        publicUrl: objectUrl,
        fileName: rawFileName,
        fileSize: fileSizeStr,
      };
    }
  }

  /**
   * Upload a user profile avatar to Supabase Storage
   */
  public async uploadAvatar(
    file: File | Blob,
    userEmail: string
  ): Promise<string> {
    const supabase = getSupabaseClient();
    const normalizedEmail = (userEmail || 'user').trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    const filePath = `avatars/${normalizedEmail}_avatar_${Date.now()}.jpg`;

    if (supabase) {
      try {
        const { data, error } = await supabase.storage
          .from(RECEIPT_BUCKET)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type || 'image/jpeg',
          });

        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from(RECEIPT_BUCKET)
            .getPublicUrl(filePath);

          if (urlData?.publicUrl) {
            return urlData.publicUrl;
          }
        }
      } catch (err) {
        console.warn('[SupabaseStorage] Avatar upload error:', err);
      }
    }

    // Fallback: Base64 data URL
    return this.fileToBase64(file);
  }

  /**
   * Delete an image from Supabase Storage
   */
  public async deleteImage(publicUrl: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase || !publicUrl || !publicUrl.includes(RECEIPT_BUCKET)) {
      return false;
    }

    try {
      // Extract the path after /claimvault-receipts/
      const parts = publicUrl.split(`/${RECEIPT_BUCKET}/`);
      if (parts.length < 2) return false;
      const filePath = decodeURIComponent(parts[1]);

      const { error } = await supabase.storage
        .from(RECEIPT_BUCKET)
        .remove([filePath]);

      return !error;
    } catch (err) {
      console.warn('[SupabaseStorage] Delete error:', err);
      return false;
    }
  }
}

export const supabaseStorageService = new SupabaseStorageService();
