export interface DbUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  currency: string;
  isPro: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbReceipt {
  id: string;
  productId: string;
  userId: string;
  fileName: string;
  imageUrl: string;
  fileSize: string;
  mimeType: string;
  uploadedAt: string;
}

export interface DbProduct {
  id: string;
  userId: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  price: number;
  currency: string;
  purchaseDate: string;
  storeName: string;
  storeLocation?: string;
  invoiceNumber?: string;
  imageUrl?: string;
  notes?: string;
  
  // Warranty
  warrantyDurationMonths: number;
  warrantyDurationLabel: string;
  warrantyStartDate: string;
  warrantyExpiryDate: string;
  warrantyType: 'Manufacturer' | 'Extended' | 'Store';
  warrantyProvider?: string;

  // Return
  hasReturnPeriod: boolean;
  returnDurationDays: number;
  returnDeadline: string;

  receipt?: DbReceipt;
  createdAt: string;
  updatedAt: string;
}

export interface DbReminder {
  id: string;
  userId: string;
  productId: string;
  reminderType: 'warranty_expiry' | 'return_deadline';
  targetDate: string;
  leadDays: number;
  status: 'pending' | 'completed' | 'dismissed';
  dismissedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbUserSettings {
  userId: string;
  currency: string;
  pushEnabled: boolean;
  soundEnabled: boolean;
  timingRules: {
    before30Days: boolean;
    before14Days: boolean;
    before7Days: boolean;
    before3Days: boolean;
    before1Day: boolean;
    onDeadline: boolean;
  };
  updatedAt: string;
}

export const SEED_USER_ID = 'usr_abdullah_pakistan_001';

export const SEED_USER: DbUser = {
  id: SEED_USER_ID,
  name: 'Abdullah Khan',
  email: 'abdullah@claimvault.pk',
  // SHA-256 for 'password123'
  passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  currency: 'PKR',
  isPro: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-09-15T00:00:00.000Z',
};

export const SEED_SETTINGS: DbUserSettings = {
  userId: SEED_USER_ID,
  currency: 'PKR',
  pushEnabled: true,
  soundEnabled: true,
  timingRules: {
    before30Days: true,
    before14Days: true,
    before7Days: true,
    before3Days: true,
    before1Day: true,
    onDeadline: true,
  },
  updatedAt: '2026-09-15T00:00:00.000Z',
};

export const SEED_PRODUCTS: DbProduct[] = [
  {
    id: 'prod_samsung_s24',
    userId: SEED_USER_ID,
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    model: '512GB Titanium Black',
    category: 'Electronics',
    price: 399999,
    currency: 'PKR',
    purchaseDate: '2026-08-01',
    storeName: 'ABC Electronics Packages Mall',
    storeLocation: 'Walton Road, Lahore',
    invoiceNumber: 'INV-2026-98124',
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80',
    notes: 'Includes 1-year Samsung Care Official Warranty and 7-day store exchange window.',
    warrantyDurationMonths: 12,
    warrantyDurationLabel: '1 Year Official',
    warrantyStartDate: '2026-08-01',
    warrantyExpiryDate: '2027-08-01',
    warrantyType: 'Manufacturer',
    warrantyProvider: 'Samsung Pakistan Care',
    hasReturnPeriod: true,
    returnDurationDays: 7,
    returnDeadline: '2026-08-08',
    receipt: {
      id: 'rcpt_samsung_s24',
      productId: 'prod_samsung_s24',
      userId: SEED_USER_ID,
      fileName: 'Samsung_S24_Invoice.jpg',
      imageUrl: 'https://images.unsplash.com/photo-1554415707-9e4c018a482d?w=800&auto=format&fit=crop&q=80',
      fileSize: '1.8 MB',
      mimeType: 'image/jpeg',
      uploadedAt: '2026-08-01T10:30:00.000Z',
    },
    createdAt: '2026-08-01T10:30:00.000Z',
    updatedAt: '2026-09-15T00:00:00.000Z',
  },
  {
    id: 'prod_dell_xps',
    userId: SEED_USER_ID,
    name: 'Dell XPS 15 (9530)',
    brand: 'Dell',
    model: 'Core i9 32GB RAM 1TB SSD OLED',
    category: 'Computing',
    price: 289999,
    currency: 'PKR',
    purchaseDate: '2026-06-15',
    storeName: 'Mega Tech Hafeez Centre',
    storeLocation: 'Main Boulevard Gulberg, Lahore',
    invoiceNumber: 'HC-DEL-44120',
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80',
    notes: '2-year Dell ProSupport on-site warranty registered.',
    warrantyDurationMonths: 24,
    warrantyDurationLabel: '2 Years ProSupport',
    warrantyStartDate: '2026-06-15',
    warrantyExpiryDate: '2028-06-15',
    warrantyType: 'Manufacturer',
    warrantyProvider: 'Dell Pakistan Direct',
    hasReturnPeriod: true,
    returnDurationDays: 14,
    returnDeadline: '2026-06-29',
    receipt: {
      id: 'rcpt_dell_xps',
      productId: 'prod_dell_xps',
      userId: SEED_USER_ID,
      fileName: 'Dell_XPS_Warranty_Invoice.jpg',
      imageUrl: 'https://images.unsplash.com/photo-1554415707-9e4c018a482d?w=800&auto=format&fit=crop&q=80',
      fileSize: '2.1 MB',
      mimeType: 'image/jpeg',
      uploadedAt: '2026-06-15T12:00:00.000Z',
    },
    createdAt: '2026-06-15T12:00:00.000Z',
    updatedAt: '2026-09-15T00:00:00.000Z',
  },
  {
    id: 'prod_haier_ac',
    userId: SEED_USER_ID,
    name: 'Haier 1.5 Ton DC Inverter AC',
    brand: 'Haier',
    model: 'HSU-18HFCD Clean Cool',
    category: 'Appliances',
    price: 165000,
    currency: 'PKR',
    purchaseDate: '2025-09-25',
    storeName: 'Hyperstar Mall of Lahore',
    storeLocation: 'Cantonment, Lahore',
    invoiceNumber: 'CAR-H-9921',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
    notes: 'Compressor warranty 10 years, PCB card 3 years, 1-year parts expiring soon.',
    warrantyDurationMonths: 12,
    warrantyDurationLabel: '1 Year Full / 10 Yr Compressor',
    warrantyStartDate: '2025-09-25',
    warrantyExpiryDate: '2026-09-25',
    warrantyType: 'Manufacturer',
    warrantyProvider: 'Haier Official Pakistan',
    hasReturnPeriod: true,
    returnDurationDays: 3,
    returnDeadline: '2025-09-28',
    receipt: {
      id: 'rcpt_haier_ac',
      productId: 'prod_haier_ac',
      userId: SEED_USER_ID,
      fileName: 'Haier_AC_Warranty_Card.jpg',
      imageUrl: 'https://images.unsplash.com/photo-1554415707-9e4c018a482d?w=800&auto=format&fit=crop&q=80',
      fileSize: '1.4 MB',
      mimeType: 'image/jpeg',
      uploadedAt: '2025-09-25T14:00:00.000Z',
    },
    createdAt: '2025-09-25T14:00:00.000Z',
    updatedAt: '2026-09-15T00:00:00.000Z',
  },
  {
    id: 'prod_sony_wh1000xm5',
    userId: SEED_USER_ID,
    name: 'Sony WH-1000XM5 ANC Headphones',
    brand: 'Sony',
    model: 'Wireless Noise Canceling Silver',
    category: 'Electronics',
    price: 98000,
    currency: 'PKR',
    purchaseDate: '2026-09-10',
    storeName: 'Daraz Mall Verified Official',
    storeLocation: 'Karachi fulfillment hub',
    invoiceNumber: 'DZ-PK-774102',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    notes: '7-day return window actively open.',
    warrantyDurationMonths: 12,
    warrantyDurationLabel: '1 Year Store Warranty',
    warrantyStartDate: '2026-09-10',
    warrantyExpiryDate: '2027-09-10',
    warrantyType: 'Store',
    warrantyProvider: 'Sony Authorized Reseller',
    hasReturnPeriod: true,
    returnDurationDays: 7,
    returnDeadline: '2026-09-17',
    createdAt: '2026-09-10T09:00:00.000Z',
    updatedAt: '2026-09-15T00:00:00.000Z',
  }
];
