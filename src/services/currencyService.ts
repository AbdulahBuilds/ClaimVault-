import { storageService } from './storageService';

const PRIMARY_API_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json';
const FALLBACK_API_URL = 'https://latest.currency-api.pages.dev/v1/currencies/usd.min.json';
const CACHE_KEY = 'claimvault_exchange_rates_cache_v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface CachedRatesPayload {
  date: string;
  timestamp: number;
  rates: Record<string, number>;
}

export const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  PKR: 278.50,
  EUR: 0.92,
  GBP: 0.79,
  INR: 86.80,
  AED: 3.6725,
  SAR: 3.75,
  CAD: 1.38,
  AUD: 1.52,
};

type RateChangeListener = (rates: Record<string, number>) => void;

class CurrencyService {
  private inMemoryRates: Record<string, number> = { ...DEFAULT_EXCHANGE_RATES };
  private listeners: Set<RateChangeListener> = new Set();
  private isFetching: boolean = false;
  private lastFetchDate: string = '';

  constructor() {
    this.loadFromCache();
    // Non-blocking background fetch on startup
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.fetchLiveRates().catch(() => {});
      }, 500);
    }
  }

  private loadFromCache(): void {
    try {
      const cached = storageService.getItem<CachedRatesPayload>(CACHE_KEY);
      if (cached && cached.rates && typeof cached.rates === 'object') {
        this.inMemoryRates = {
          ...DEFAULT_EXCHANGE_RATES,
          ...cached.rates,
        };
        this.lastFetchDate = cached.date || '';
      }
    } catch {
      // Ignore cache errors
    }
  }

  public getRates(): Record<string, number> {
    return { ...this.inMemoryRates };
  }

  public getRate(currencyCode: string): number {
    const code = currencyCode.toUpperCase();
    return this.inMemoryRates[code] || DEFAULT_EXCHANGE_RATES[code] || 1.0;
  }

  public getLastUpdatedDate(): string {
    return this.lastFetchDate;
  }

  public subscribe(listener: RateChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const rates = this.getRates();
    this.listeners.forEach((listener) => {
      try {
        listener(rates);
      } catch (err) {
        console.warn('[CurrencyService] Listener notification error:', err);
      }
    });
  }

  /**
   * Fetches latest exchange rates from primary CDN (jsDelivr) with Cloudflare Pages fallback
   */
  public async fetchLiveRates(force: boolean = false): Promise<Record<string, number>> {
    const cached = storageService.getItem<CachedRatesPayload>(CACHE_KEY);
    const now = Date.now();

    if (!force && cached && now - cached.timestamp < CACHE_TTL_MS && Object.keys(cached.rates).length > 0) {
      return this.inMemoryRates;
    }

    if (this.isFetching) {
      return this.inMemoryRates;
    }

    this.isFetching = true;

    try {
      let data: any = null;

      // 1. Try Primary endpoint (jsDelivr)
      try {
        const res = await fetch(PRIMARY_API_URL, { cache: 'no-cache' });
        if (res.ok) {
          data = await res.json();
        }
      } catch (e) {
        console.warn('[CurrencyService] Primary jsDelivr rate fetch failed, trying fallback...', e);
      }

      // 2. Try Fallback endpoint (Cloudflare Pages) if primary failed
      if (!data || !data.usd) {
        try {
          const resFallback = await fetch(FALLBACK_API_URL, { cache: 'no-cache' });
          if (resFallback.ok) {
            data = await resFallback.json();
          }
        } catch (e) {
          console.warn('[CurrencyService] Fallback Cloudflare Pages rate fetch failed:', e);
        }
      }

      // 3. Process and cache rates if valid response received
      if (data && data.usd && typeof data.usd === 'object') {
        const rawUsdRates = data.usd;
        const normalizedRates: Record<string, number> = { ...DEFAULT_EXCHANGE_RATES };

        for (const [key, val] of Object.entries(rawUsdRates)) {
          if (typeof val === 'number' && !isNaN(val) && val > 0) {
            normalizedRates[key.toUpperCase()] = val;
          }
        }

        normalizedRates['USD'] = 1.0;
        this.inMemoryRates = normalizedRates;
        this.lastFetchDate = data.date || new Date().toISOString().split('T')[0];

        const payload: CachedRatesPayload = {
          date: this.lastFetchDate,
          timestamp: now,
          rates: normalizedRates,
        };

        storageService.setItem(CACHE_KEY, payload);
        this.notifyListeners();
      }
    } catch (err) {
      console.warn('[CurrencyService] Could not fetch live exchange rates, keeping current rates:', err);
    } finally {
      this.isFetching = false;
    }

    return this.inMemoryRates;
  }
}

export const currencyService = new CurrencyService();
