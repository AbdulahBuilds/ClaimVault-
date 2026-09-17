export type UrgencyStatus = 'safe' | 'expiring' | 'expired';

export type ProductCategory = 
  | 'Electronics'
  | 'Appliances'
  | 'Computing'
  | 'Audio'
  | 'Kitchen'
  | 'Wearables'
  | 'Home'
  | 'Vehicles'
  | 'Other';

export interface Receipt {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  fileName: string;
  uploadedAt: string;
  fileSize?: string;
  merchantName?: string;
  totalAmount?: number;
}

export interface WarrantyInfo {
  durationMonths: number;
  durationLabel: string; // e.g., "1 Year", "2 Years", "10 Years (Compressor)"
  startDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  status: UrgencyStatus;
  warrantyType: 'Manufacturer' | 'Extended' | 'Store' | 'Limited';
  providerName?: string;
  notes?: string;
}

export interface ReturnInfo {
  hasReturnPeriod: boolean;
  returnDurationDays: number;
  returnDeadline: string; // YYYY-MM-DD
  status: UrgencyStatus;
  policyNotes?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: ProductCategory;
  price: number; // in PKR
  currency: string; // 'PKR'
  purchaseDate: string; // YYYY-MM-DD
  storeName: string;
  storeLocation?: string;
  invoiceNumber?: string;
  serialNumber?: string;
  imageUrl?: string;
  receipt?: Receipt;
  warranty: WarrantyInfo;
  returnInfo: ReturnInfo;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReminderType = 'return' | 'warranty' | 'custom';

export interface Reminder {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  category: ProductCategory;
  type: ReminderType;
  title: string;
  subtitle: string;
  dueDate: string; // YYYY-MM-DD
  daysRemaining: number;
  urgency: UrgencyStatus;
  timeBucket: 'today' | 'this_week' | 'later';
  isCompleted: boolean;
  productPrice: number;
  productCurrency?: string;
  imageUrl?: string;
  ruleLabel?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  currency: string;
  isPro: boolean;
  memberSince: string;
  notificationsEnabled: boolean;
  reminderLeadTimes: number[]; // e.g. [30, 7, 1] days before
}

export type User = UserProfile;

export type FilterType = 'all' | 'active' | 'expiring' | 'expired' | 'return_period';

export type SortType = 'expiry_asc' | 'expiry_desc' | 'purchase_desc' | 'price_desc' | 'name_asc';

export interface SummaryStats {
  totalProducts: number;
  activeWarranties: number;
  expiringSoon: number;
  returnDeadlinesActive: number;
  totalProtectedValue: number;
}
