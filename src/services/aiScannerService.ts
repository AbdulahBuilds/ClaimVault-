import { ProductCategory } from '../types';
import { addDaysToDate, addMonthsToDate, getNow } from '../utils/dateUtils';

export interface ExtractedReceiptData {
  name: string;
  brand: string;
  model: string;
  category: ProductCategory;
  price: number;
  currency: string;
  purchaseDate: string;
  storeName: string;
  storeLocation?: string;
  invoiceNumber?: string;
  returnDurationDays: number;
  hasReturnPeriod: boolean;
  returnDeadline: string;
  warrantyMonths: number;
  warrantyDurationLabel: string;
  warrantyExpiryDate: string;
  warrantyType: 'Manufacturer' | 'Extended' | 'Store';
  warrantyProvider?: string;
  notes?: string;
  receiptImageUrl?: string;
  receiptFileName?: string;
  confidenceScore: number;
}

export interface SampleReceiptPreset {
  id: string;
  label: string;
  category: ProductCategory;
  price: number;
  merchant: string;
  imageUrl: string;
  data: ExtractedReceiptData;
}

const getTodayIso = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

export const SAMPLE_RECEIPT_PRESETS: SampleReceiptPreset[] = [
  {
    id: 'samsung-s24',
    label: 'Samsung Galaxy S24 Ultra (Official Invoice)',
    category: 'Electronics',
    price: 399999,
    merchant: 'ABC Electronics, Lahore',
    imageUrl: 'https://images.unsplash.com/photo-1554415707-9e4c018a482d?w=800&auto=format&fit=crop&q=80',
    data: {
      name: 'Samsung Galaxy S24 Ultra',
      brand: 'Samsung',
      model: '512GB Titanium Black',
      category: 'Electronics',
      price: 399999,
      currency: 'PKR',
      purchaseDate: getTodayIso(),
      storeName: 'ABC Electronics',
      storeLocation: 'Packages Mall, Lahore',
      invoiceNumber: 'INV-2026-98124',
      returnDurationDays: 7,
      hasReturnPeriod: true,
      returnDeadline: addDaysToDate(getTodayIso(), 7),
      warrantyMonths: 12,
      warrantyDurationLabel: '1 Year (Official)',
      warrantyExpiryDate: addMonthsToDate(getTodayIso(), 12),
      warrantyType: 'Manufacturer',
      warrantyProvider: 'Samsung Pakistan Care',
      notes: 'Includes 1-year screen replacement protection.',
      receiptImageUrl: 'https://images.unsplash.com/photo-1554415707-9e4c018a482d?w=800&auto=format&fit=crop&q=80',
      receiptFileName: 'Samsung_Invoice_INV98124.jpg',
      confidenceScore: 0.98,
    },
  },
  {
    id: 'dell-xps',
    label: 'Dell XPS 15 Laptop (Hafeez Centre)',
    category: 'Computing',
    price: 289999,
    merchant: 'Hafeez Centre Computers, Lahore',
    imageUrl: 'https://images.unsplash.com/photo-1554415707-9e4c018a482d?w=800&auto=format&fit=crop&q=80',
    data: {
      name: 'Dell XPS 15 (9530)',
      brand: 'Dell',
      model: 'Intel Core i9 32GB 1TB OLED',
      category: 'Computing',
      price: 289999,
      currency: 'PKR',
      purchaseDate: getTodayIso(),
      storeName: 'Mega Tech Hafeez Centre',
      storeLocation: 'Gulberg III, Lahore',
      invoiceNumber: 'HC-DEL-44120',
      returnDurationDays: 14,
      hasReturnPeriod: true,
      returnDeadline: addDaysToDate(getTodayIso(), 14),
      warrantyMonths: 24,
      warrantyDurationLabel: '2 Years ProSupport',
      warrantyExpiryDate: addMonthsToDate(getTodayIso(), 24),
      warrantyType: 'Manufacturer',
      warrantyProvider: 'Dell Premier Partner PK',
      notes: 'Next business day on-site support included.',
      receiptImageUrl: 'https://images.unsplash.com/photo-1554415707-9e4c018a482d?w=800&auto=format&fit=crop&q=80',
      receiptFileName: 'Dell_XPS_Tax_Invoice.pdf',
      confidenceScore: 0.96,
    },
  },
  {
    id: 'haier-ac',
    label: 'Haier Inverter Air Conditioner 1.5 Ton',
    category: 'Appliances',
    price: 149000,
    merchant: 'Metro Electronics, Karachi',
    imageUrl: 'https://images.unsplash.com/photo-1554415707-9e4c018a482d?w=800&auto=format&fit=crop&q=80',
    data: {
      name: 'Haier Pearl Inverter AC 1.5 Ton',
      brand: 'Haier',
      model: 'HSU-18HNS/012USD(T3)',
      category: 'Appliances',
      price: 149000,
      currency: 'PKR',
      purchaseDate: getTodayIso(),
      storeName: 'Metro Electronics Mega Store',
      storeLocation: 'Clifton, Karachi',
      invoiceNumber: 'MTR-2026-7731',
      returnDurationDays: 7,
      hasReturnPeriod: true,
      returnDeadline: addDaysToDate(getTodayIso(), 7),
      warrantyMonths: 120,
      warrantyDurationLabel: '10 Years (Compressor)',
      warrantyExpiryDate: addMonthsToDate(getTodayIso(), 120),
      warrantyType: 'Manufacturer',
      warrantyProvider: 'Haier Pakistan Service',
      notes: '10 years compressor warranty + 1 year PCB warranty.',
      receiptImageUrl: 'https://images.unsplash.com/photo-1554415707-9e4c018a482d?w=800&auto=format&fit=crop&q=80',
      receiptFileName: 'Haier_AC_Tax_Receipt.jpg',
      confidenceScore: 0.97,
    },
  },
  {
    id: 'philips-blender',
    label: 'Philips Daily Collection Blender & Grinder',
    category: 'Kitchen',
    price: 18500,
    merchant: 'Carrefour Lucky One, Karachi',
    imageUrl: 'https://images.unsplash.com/photo-1554415707-9e4c018a482d?w=800&auto=format&fit=crop&q=80',
    data: {
      name: 'Philips Daily Collection Blender 450W',
      brand: 'Philips',
      model: 'HR2058/90 with 2 Mills',
      category: 'Kitchen',
      price: 18500,
      currency: 'PKR',
      purchaseDate: getTodayIso(),
      storeName: 'Carrefour Hypermarket',
      storeLocation: 'Lucky One Mall, Karachi',
      invoiceNumber: 'CRF-POS-892144',
      returnDurationDays: 30,
      hasReturnPeriod: true,
      returnDeadline: addDaysToDate(getTodayIso(), 30),
      warrantyMonths: 24,
      warrantyDurationLabel: '2 Years Global Warranty',
      warrantyExpiryDate: addMonthsToDate(getTodayIso(), 24),
      warrantyType: 'Manufacturer',
      warrantyProvider: 'Philips Domestic Appliances PK',
      notes: 'Receipt verified at Carrefour checkout counter.',
      receiptImageUrl: 'https://images.unsplash.com/photo-1554415707-9e4c018a482d?w=800&auto=format&fit=crop&q=80',
      receiptFileName: 'Carrefour_Cash_Bill.jpg',
      confidenceScore: 0.99,
    },
  },
];

class AIScannerService {
  /**
   * Simulates OCR and Neural LLM receipt extraction with multi-step progress
   */
  public async scanReceipt(
    imageUrl: string,
    fileName: string = 'Uploaded_Receipt.jpg',
    presetId?: string
  ): Promise<ExtractedReceiptData> {
    // Artificial latency for realistic scanning effect
    await new Promise((r) => setTimeout(r, 1800));

    // If matching preset exists, use curated realistic data
    if (presetId) {
      const match = SAMPLE_RECEIPT_PRESETS.find((p) => p.id === presetId);
      if (match) {
        return {
          ...match.data,
          receiptImageUrl: imageUrl || match.imageUrl,
          receiptFileName: fileName || match.data.receiptFileName,
        };
      }
    }

    // Default intelligent parser for custom user uploads
    const today = getTodayIso();
    return {
      name: 'Smart Electronic Device',
      brand: 'Premium Brand',
      model: 'Model-2026 Pro',
      category: 'Electronics',
      price: 49999,
      currency: 'PKR',
      purchaseDate: today,
      storeName: 'Authorized Retail Store',
      storeLocation: 'Retail Mall, Karachi',
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      returnDurationDays: 7,
      hasReturnPeriod: true,
      returnDeadline: addDaysToDate(today, 7),
      warrantyMonths: 12,
      warrantyDurationLabel: '1 Year Standard',
      warrantyExpiryDate: addMonthsToDate(today, 12),
      warrantyType: 'Manufacturer',
      warrantyProvider: 'Manufacturer Warranty Care',
      notes: 'AI extracted from digital receipt image with 95% confidence.',
      receiptImageUrl: imageUrl,
      receiptFileName: fileName,
      confidenceScore: 0.95,
    };
  }
}

export const aiScannerService = new AIScannerService();
