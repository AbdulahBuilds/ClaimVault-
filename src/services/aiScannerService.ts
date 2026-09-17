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
  isAiExtracted?: boolean;
}

const getTodayIso = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

// Helper functions for cleaning & sanitizing extracted values
function cleanPrice(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (typeof val === 'string') {
    const num = parseFloat(val.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

function cleanWarrantyMonths(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 12 : Math.max(0, Math.round(val));
  if (typeof val === 'string') {
    const lower = val.toLowerCase();
    if (lower.includes('year')) {
      const yrs = parseFloat(val.replace(/[^0-9.]/g, ''));
      return isNaN(yrs) ? 12 : Math.round(yrs * 12);
    }
    const m = parseInt(val.replace(/[^0-9]/g, ''), 10);
    return isNaN(m) ? 12 : Math.max(0, m);
  }
  return 12;
}

function cleanReturnDays(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 7 : Math.max(0, Math.round(val));
  if (typeof val === 'string') {
    const d = parseInt(val.replace(/[^0-9]/g, ''), 10);
    return isNaN(d) ? 7 : Math.max(0, d);
  }
  return 7;
}

function normalizeCategory(cat: string | undefined): ProductCategory {
  if (!cat) return 'Electronics';
  const c = cat.toLowerCase().trim();
  if (c.includes('comput') || c.includes('laptop') || c.includes('pc') || c.includes('mac') || c.includes('monitor')) return 'Computing';
  if (c.includes('audio') || c.includes('headphone') || c.includes('earphone') || c.includes('sound') || c.includes('speaker') || c.includes('mic')) return 'Audio';
  if (c.includes('wear') || c.includes('watch') || c.includes('band') || c.includes('fitness')) return 'Wearables';
  if (c.includes('kitchen') || c.includes('blender') || c.includes('cooker') || c.includes('fryer') || c.includes('oven') || c.includes('microwave') || c.includes('kettle')) return 'Kitchen';
  if (c.includes('appliance') || c.includes('refriger') || c.includes('ac') || c.includes('air conditioner') || c.includes('washing') || c.includes('heater')) return 'Appliances';
  if (c.includes('vehicle') || c.includes('car') || c.includes('bike') || c.includes('auto') || c.includes('motor')) return 'Vehicles';
  if (c.includes('home') || c.includes('furnit') || c.includes('light') || c.includes('bed') || c.includes('decor')) return 'Home';
  if (c.includes('phone') || c.includes('electronic') || c.includes('tv') || c.includes('display') || c.includes('tablet') || c.includes('camera')) return 'Electronics';
  return 'Other';
}

function normalizeDate(dStr: string | undefined, defaultDate: string): string {
  if (!dStr) return defaultDate;
  const trimmed = dStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return defaultDate;
}

class AIScannerService {
  private getApiKey(): string {
    return import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  /**
   * Converts an image URL (data URI, remote URL, or blob URL) to a base64 string and MIME type
   */
  private async imageToBase64(imageUrl: string): Promise<{ data: string; mimeType: string } | null> {
    try {
      if (imageUrl.startsWith('data:')) {
        const parts = imageUrl.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        return { data: parts[1], mimeType: mime };
      }

      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          const parts = res.split(',');
          const mime = blob.type || parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
          resolve({ data: parts[1], mimeType: mime });
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }

  /**
   * Calls AI Vision API to analyze receipt image and extract structured JSON
   */
  private async callGeminiVision(base64Data: string, mimeType: string): Promise<Partial<ExtractedReceiptData> | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.warn('[AIScanner] Missing VITE_GEMINI_API_KEY in environment');
      return null;
    }

    // List active, supported models in order of priority
    const models = [
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-flash-latest',
      'gemini-3.7-flash',
      'gemini-3-flash-preview',
      'gemini-2.5-pro',
    ];

    const prompt = `You are ClaimVault AI, an expert invoice, receipt, warranty card, and bill OCR parser.
Analyze this invoice/receipt image carefully and extract all product, purchase, store, warranty, and return policy details.

STRICT FACTUALITY & ANTI-HALLUCINATION RULES:
- ONLY extract information that is explicitly and visibly written on the receipt image.
- NEVER guess, assume, extrapolate, or append country names (such as "India", "Pakistan", "USA", etc.) or city names unless that exact word/country is visibly printed on the receipt.
- Do NOT infer geographical locations from brand names, store names, currencies, tax formats, or company registrations.

Extraction Rules:
1. Product Details: Extract the primary purchased item name (e.g., "Samsung Galaxy S24 Ultra", "Haier Pearl Inverter AC 1.5 Ton"), Brand name (e.g. "Samsung", "Apple", "Dell", "Haier", "Philips", "Sony"), and specific Model/specs.
2. Category: Categorize into exactly one of: "Electronics", "Computing", "Audio", "Appliances", "Kitchen", "Wearables", "Home", "Vehicles", "Other".
3. Price & Currency: Extract the total price paid as a clean integer/float number without commas (e.g. 149000, 399999). Extract the currency symbol/code (e.g., "PKR", "USD", "INR", "EUR", "GBP", "AED") based solely on what is printed on the invoice.
4. Purchase Date: Extract the invoice/purchase date in strict "YYYY-MM-DD" ISO format. If missing or illegible, use today's date (${getTodayIso()}).
5. Store & Invoice: Extract the merchant/store name and invoice or receipt number. For "storeLocation", include ONLY the city/branch explicitly printed on the receipt. If no location or address is printed, return an empty string "". NEVER append unprinted country names.
6. Warranty Terms: Extract warranty duration in months (e.g., 12, 24, 36; or 0 if no warranty), warranty label (e.g. "1 Year", "2 Years"), warranty type ("Manufacturer" | "Extended" | "Store"), and warranty provider. For "warrantyProvider", extract only the exact entity/brand printed. Do NOT add country suffixes (e.g., do not convert "Samsung" into "Samsung India").
7. Return Policy: Extract return window days (e.g. 7, 14, 30; or 0 if no returns allowed), hasReturnPeriod (boolean). If not specified on receipt, default to 7 days.
8. Calculated Deadlines: Calculate returnDeadline (purchaseDate + returnDurationDays) and warrantyExpiryDate (purchaseDate + warrantyMonths) in strict "YYYY-MM-DD" format.
9. Notes: Provide a concise summary of extracted terms, coverage, or serial numbers visibly present on the receipt. Do not add inferred country assumptions.
10. Confidence: A realistic score between 0.85 and 0.99 representing scan readability.

Return ONLY a valid JSON object matching this schema:
{
  "name": string,
  "brand": string,
  "model": string,
  "category": "Electronics" | "Computing" | "Audio" | "Appliances" | "Kitchen" | "Wearables" | "Home" | "Vehicles" | "Other",
  "price": number,
  "currency": string,
  "purchaseDate": "YYYY-MM-DD",
  "storeName": string,
  "storeLocation": string,
  "invoiceNumber": string,
  "returnDurationDays": number,
  "hasReturnPeriod": boolean,
  "returnDeadline": "YYYY-MM-DD",
  "warrantyMonths": number,
  "warrantyDurationLabel": string,
  "warrantyExpiryDate": "YYYY-MM-DD",
  "warrantyType": "Manufacturer" | "Extended" | "Store",
  "warrantyProvider": string,
  "notes": string,
  "confidenceScore": number
}`;

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    {
                      inline_data: {
                        mime_type: mimeType,
                        data: base64Data,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.1,
              },
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const cleanText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const firstBrace = cleanText.indexOf('{');
            const lastBrace = cleanText.lastIndexOf('}');
            const jsonStr = (firstBrace !== -1 && lastBrace !== -1)
              ? cleanText.substring(firstBrace, lastBrace + 1)
              : cleanText;
            
            const parsed = JSON.parse(jsonStr);
            if (parsed && typeof parsed === 'object') {
              return parsed;
            }
          }
        } else {
          console.warn(`[AIScanner] Model ${model} returned status ${response.status}`);
        }
      } catch (err) {
        console.warn(`[AIScanner] Model ${model} request failed:`, err);
      }
    }

    return null;
  }

  /**
   * Scans a receipt image using AI Vision OCR
   */
  public async scanReceipt(
    imageUrl: string,
    fileName: string = 'Uploaded_Receipt.jpg'
  ): Promise<ExtractedReceiptData> {
    const today = getTodayIso();

    // AI Vision OCR scanning
    if (imageUrl) {
      try {
        const base64Info = await this.imageToBase64(imageUrl);
        if (base64Info && base64Info.data) {
          const geminiResult = await this.callGeminiVision(base64Info.data, base64Info.mimeType);
          if (geminiResult && geminiResult.name) {
            const purchaseDate = normalizeDate(geminiResult.purchaseDate, today);
            const returnDurationDays = cleanReturnDays(geminiResult.returnDurationDays);
            const hasReturnPeriod = Boolean(geminiResult.hasReturnPeriod ?? returnDurationDays > 0);
            const returnDeadline = geminiResult.returnDeadline && /^\d{4}-\d{2}-\d{2}$/.test(geminiResult.returnDeadline)
              ? geminiResult.returnDeadline
              : addDaysToDate(purchaseDate, returnDurationDays);

            const warrantyMonths = cleanWarrantyMonths(geminiResult.warrantyMonths);
            const warrantyExpiryDate = geminiResult.warrantyExpiryDate && /^\d{4}-\d{2}-\d{2}$/.test(geminiResult.warrantyExpiryDate)
              ? geminiResult.warrantyExpiryDate
              : addMonthsToDate(purchaseDate, warrantyMonths);
            
            const warrantyDurationLabel = geminiResult.warrantyDurationLabel || 
              (warrantyMonths >= 12
                ? `${Math.round(warrantyMonths / 12)} Year${warrantyMonths > 12 ? 's' : ''}`
                : `${warrantyMonths} Months`);

            const category: ProductCategory = normalizeCategory(geminiResult.category);
            const price = cleanPrice(geminiResult.price);

            return {
              name: (geminiResult.name || 'Purchased Item').trim(),
              brand: (geminiResult.brand || '').trim(),
              model: (geminiResult.model || '').trim(),
              category,
              price,
              currency: geminiResult.currency || 'PKR',
              purchaseDate,
              storeName: (geminiResult.storeName || 'Retail Store').trim(),
              storeLocation: (geminiResult.storeLocation || '').trim(),
              invoiceNumber: (geminiResult.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`).trim(),
              returnDurationDays,
              hasReturnPeriod,
              returnDeadline,
              warrantyMonths,
              warrantyDurationLabel,
              warrantyExpiryDate,
              warrantyType: (geminiResult.warrantyType as any) || 'Manufacturer',
              warrantyProvider: (geminiResult.warrantyProvider || geminiResult.brand || 'Manufacturer Care').trim(),
              notes: geminiResult.notes || 'Scanned with AI Scanner.',
              receiptImageUrl: imageUrl,
              receiptFileName: fileName,
              confidenceScore: typeof geminiResult.confidenceScore === 'number' ? geminiResult.confidenceScore : 0.95,
              isAiExtracted: true,
            };
          }
        }
      } catch (err) {
        console.warn('[AIScanner] Gemini extraction error:', err);
      }
    }

    // 3. If scanning could not extract details, throw descriptive error so UI can alert the user
    throw new Error('AI could not recognize receipt details from this image. Please upload a clear photo or enter the product details manually.');
  }
}

export const aiScannerService = new AIScannerService();
