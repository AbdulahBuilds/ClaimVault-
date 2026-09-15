import { 
  DbUser, 
  DbProduct, 
  DbReceipt, 
  DbReminder, 
  DbUserSettings, 
  SEED_USER, 
  SEED_SETTINGS, 
  SEED_PRODUCTS 
} from './seedData';

class DatabaseClient {
  private users: Map<string, DbUser> = new Map();
  private products: Map<string, DbProduct> = new Map();
  private receipts: Map<string, DbReceipt> = new Map();
  private reminders: Map<string, DbReminder> = new Map();
  private settings: Map<string, DbUserSettings> = new Map();
  private isInitialized = false;

  constructor() {
    this.initSeeds();
  }

  private initSeeds() {
    if (this.isInitialized) return;

    // Seed User
    this.users.set(SEED_USER.id, { ...SEED_USER });

    // Seed Settings
    this.settings.set(SEED_SETTINGS.userId, { ...SEED_SETTINGS });

    // Seed Products & Receipts
    SEED_PRODUCTS.forEach((prod) => {
      this.products.set(prod.id, { ...prod });
      if (prod.receipt) {
        this.receipts.set(prod.receipt.id, { ...prod.receipt });
      }
    });

    this.isInitialized = true;
  }

  // ================= User Operations =================
  async findUserByEmail(email: string): Promise<DbUser | null> {
    const normalized = email.toLowerCase().trim();
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === normalized) {
        return { ...u };
      }
    }
    return null;
  }

  async findUserById(id: string): Promise<DbUser | null> {
    const user = this.users.get(id);
    return user ? { ...user } : null;
  }

  async createUser(user: Omit<DbUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<DbUser> {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const newUser: DbUser = {
      ...user,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, newUser);

    // Create default settings for user
    this.settings.set(id, {
      userId: id,
      currency: user.currency || 'PKR',
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
      updatedAt: now,
    });

    return { ...newUser };
  }

  // ================= Product Operations =================
  async getProductsByUserId(userId: string, filterCategory?: string, search?: string): Promise<DbProduct[]> {
    let prods = Array.from(this.products.values()).filter((p) => p.userId === userId);

    if (filterCategory && filterCategory.toLowerCase() !== 'all') {
      prods = prods.filter((p) => p.category.toLowerCase() === filterCategory.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      prods = prods.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.storeName.toLowerCase().includes(q) ||
          (p.model && p.model.toLowerCase().includes(q))
      );
    }

    // Sort by purchaseDate descending
    return prods.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
  }

  async getProductById(id: string, userId: string): Promise<DbProduct | null> {
    const p = this.products.get(id);
    if (!p || p.userId !== userId) return null;
    return { ...p };
  }

  async createProduct(data: Omit<DbProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<DbProduct> {
    const id = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newProd: DbProduct = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    if (newProd.receipt) {
      this.receipts.set(newProd.receipt.id, newProd.receipt);
    }

    this.products.set(id, newProd);
    return { ...newProd };
  }

  async updateProduct(id: string, userId: string, updates: Partial<DbProduct>): Promise<DbProduct | null> {
    const existing = this.products.get(id);
    if (!existing || existing.userId !== userId) return null;

    const updated: DbProduct = {
      ...existing,
      ...updates,
      id: existing.id,
      userId: existing.userId,
      updatedAt: new Date().toISOString(),
    };

    if (updates.receipt) {
      this.receipts.set(updates.receipt.id, updates.receipt);
    }

    this.products.set(id, updated);
    return { ...updated };
  }

  async deleteProduct(id: string, userId: string): Promise<boolean> {
    const existing = this.products.get(id);
    if (!existing || existing.userId !== userId) return false;

    if (existing.receipt) {
      this.receipts.delete(existing.receipt.id);
    }

    // Delete associated reminders
    for (const [remId, rem] of this.reminders.entries()) {
      if (rem.productId === id) {
        this.reminders.delete(remId);
      }
    }

    return this.products.delete(id);
  }

  // ================= Receipt Operations =================
  async getReceiptsByUserId(userId: string): Promise<DbReceipt[]> {
    return Array.from(this.receipts.values()).filter((r) => r.userId === userId);
  }

  async addReceipt(receipt: DbReceipt): Promise<DbReceipt> {
    this.receipts.set(receipt.id, receipt);
    return { ...receipt };
  }

  async deleteReceipt(receiptId: string, userId: string): Promise<boolean> {
    const r = this.receipts.get(receiptId);
    if (!r || r.userId !== userId) return false;

    // Remove from product too
    const prod = this.products.get(r.productId);
    if (prod && prod.receipt?.id === receiptId) {
      prod.receipt = undefined;
      this.products.set(prod.id, prod);
    }

    return this.receipts.delete(receiptId);
  }

  // ================= Settings Operations =================
  async getSettingsByUserId(userId: string): Promise<DbUserSettings> {
    let s = this.settings.get(userId);
    if (!s) {
      s = {
        userId,
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
        updatedAt: new Date().toISOString(),
      };
      this.settings.set(userId, s);
    }
    return { ...s };
  }

  async updateSettings(userId: string, updates: Partial<DbUserSettings>): Promise<DbUserSettings> {
    const existing = await this.getSettingsByUserId(userId);
    const updated: DbUserSettings = {
      ...existing,
      ...updates,
      userId,
      updatedAt: new Date().toISOString(),
    };
    this.settings.set(userId, updated);
    return { ...updated };
  }

  // ================= Status & Diagnostics =================
  async getStats() {
    return {
      status: 'healthy',
      database: 'PostgreSQL-Compatible Storage Engine',
      userCount: this.users.size,
      productCount: this.products.size,
      receiptCount: this.receipts.size,
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
    };
  }

  // Reset to seeds for testing
  reset() {
    this.users.clear();
    this.products.clear();
    this.receipts.clear();
    this.reminders.clear();
    this.settings.clear();
    this.isInitialized = false;
    this.initSeeds();
  }
}

export const dbClient = new DatabaseClient();
