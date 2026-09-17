import { storageService, STORAGE_KEYS } from '../services/storageService';
import { currencyService, DEFAULT_EXCHANGE_RATES } from '../services/currencyService';
import { UserProfile } from '../types';

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  country: string;
  locale: string;
  symbolPosition: 'prefix' | 'suffix' | 'prefix_space';
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  PKR: {
    code: 'PKR',
    name: 'Pakistani Rupee',
    symbol: 'Rs.',
    country: 'Pakistan (Default)',
    locale: 'en-PK',
    symbolPosition: 'prefix_space',
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    country: 'United States',
    locale: 'en-US',
    symbolPosition: 'prefix',
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    country: 'European Union',
    locale: 'de-DE',
    symbolPosition: 'prefix',
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    country: 'United Kingdom',
    locale: 'en-GB',
    symbolPosition: 'prefix',
  },
  INR: {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    country: 'India',
    locale: 'en-IN',
    symbolPosition: 'prefix',
  },
  AED: {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'AED',
    country: 'United Arab Emirates',
    locale: 'en-AE',
    symbolPosition: 'prefix_space',
  },
  SAR: {
    code: 'SAR',
    name: 'Saudi Riyal',
    symbol: 'SAR',
    country: 'Saudi Arabia',
    locale: 'en-SA',
    symbolPosition: 'prefix_space',
  },
  CAD: {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'CA$',
    country: 'Canada',
    locale: 'en-CA',
    symbolPosition: 'prefix',
  },
  AUD: {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'AU$',
    country: 'Australia',
    locale: 'en-AU',
    symbolPosition: 'prefix',
  },
};

export const CURRENCY_LIST: CurrencyInfo[] = Object.values(SUPPORTED_CURRENCIES);

export const EXCHANGE_RATES = DEFAULT_EXCHANGE_RATES;

/**
 * Gets the user's active selected currency from local storage or defaults to PKR
 */
export function getUserActiveCurrency(): string {
  try {
    const user = storageService.getItem<UserProfile>(STORAGE_KEYS.USER);
    return (user?.currency || 'PKR').toUpperCase();
  } catch {
    return 'PKR';
  }
}

/**
 * Returns symbol for given currency code (e.g. '$', 'Rs.', '€', '₹')
 */
export function getCurrencySymbol(currencyCode?: string): string {
  const code = (currencyCode || getUserActiveCurrency()).toUpperCase();
  const info = SUPPORTED_CURRENCIES[code];
  return info ? info.symbol : code;
}

/**
 * Converts an amount from one currency to another using live or cached exchange rates.
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string = 'PKR',
  toCurrency?: string
): number {
  if (amount === undefined || amount === null || isNaN(amount) || amount === 0) {
    return 0;
  }

  const from = (fromCurrency || 'PKR').toUpperCase();
  const to = (toCurrency || getUserActiveCurrency()).toUpperCase();

  if (from === to) return amount;

  const fromRate = currencyService.getRate(from) || DEFAULT_EXCHANGE_RATES[from] || 1.0;
  const toRate = currencyService.getRate(to) || DEFAULT_EXCHANGE_RATES[to] || 1.0;

  // Convert from origin currency to USD base, then to target currency
  const amountInUSD = amount / fromRate;
  const converted = amountInUSD * toRate;

  return converted;
}

/**
 * Formats any amount into currency format based on active user preference or provided currency code.
 * If fromCurrency is supplied and differs from target currencyCode, amount is converted using live exchange rates.
 */
export function formatCurrency(
  amount: number,
  currencyCode?: string,
  showPrefix: boolean = true,
  fromCurrency?: string
): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    const target = (currencyCode || getUserActiveCurrency()).toUpperCase();
    const sym = getCurrencySymbol(target);
    return showPrefix ? `${sym} 0` : '0';
  }

  const targetCode = (currencyCode || getUserActiveCurrency()).toUpperCase();
  const sourceCode = fromCurrency ? fromCurrency.toUpperCase() : undefined;

  // If source currency is specified and differs from targetCode, convert before formatting
  const finalAmount = sourceCode && sourceCode !== targetCode
    ? convertCurrency(amount, sourceCode, targetCode)
    : amount;

  const info = SUPPORTED_CURRENCIES[targetCode];
  const locale = info ? info.locale : 'en-US';
  const symbol = info ? info.symbol : targetCode;
  const position = info ? info.symbolPosition : 'prefix_space';

  // Precision rules:
  // For currencies like USD/EUR/GBP/CAD/AUD/AED/SAR: show 2 decimals if not whole or if small
  const isDecimalCurrency = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'AED', 'SAR'].includes(targetCode);
  const showDecimals = (isDecimalCurrency && (finalAmount < 1000 || finalAmount % 1 !== 0)) || (finalAmount % 1 !== 0);

  const formattedNum = new Intl.NumberFormat(locale, {
    minimumFractionDigits: showDecimals && finalAmount < 1000 ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(finalAmount);

  if (!showPrefix) {
    return formattedNum;
  }

  if (position === 'prefix') {
    return `${symbol}${formattedNum}`;
  }
  if (position === 'suffix') {
    return `${formattedNum} ${symbol}`;
  }
  return `${symbol} ${formattedNum}`;
}

/**
 * Formats a product's price from its purchase currency to the active display currency.
 * E.g. 3000 PKR to USD -> "$10.77", 3000 PKR to PKR -> "Rs. 3,000"
 */
export function formatProductPrice(
  price: number,
  productCurrency?: string,
  targetCurrency?: string
): string {
  const target = (targetCurrency || getUserActiveCurrency()).toUpperCase();
  const source = (productCurrency || 'PKR').toUpperCase();
  return formatCurrency(price, target, true, source);
}

/**
 * Format large amounts into compact representation (e.g. $1.2M, Rs. 1.2M, ₹590K)
 */
export function formatCompactCurrency(
  amount: number, 
  currencyCode?: string,
  fromCurrency?: string
): string {
  const targetCode = (currencyCode || getUserActiveCurrency()).toUpperCase();
  const sourceCode = fromCurrency ? fromCurrency.toUpperCase() : undefined;

  const finalAmount = sourceCode && sourceCode !== targetCode
    ? convertCurrency(amount, sourceCode, targetCode)
    : amount;

  const sym = getCurrencySymbol(targetCode);
  const info = SUPPORTED_CURRENCIES[targetCode];
  const space = info?.symbolPosition === 'prefix_space' ? ' ' : '';

  if (finalAmount >= 1000000) {
    return `${sym}${space}${(finalAmount / 1000000).toFixed(1)}M`;
  }
  if (finalAmount >= 1000) {
    return `${sym}${space}${(finalAmount / 1000).toFixed(0)}K`;
  }
  return formatCurrency(finalAmount, targetCode);
}

/**
 * Backward-compatible helper for existing components.
 */
export function formatPKR(
  amount: number,
  showPrefix: boolean = true,
  currencyOverride?: string
): string {
  return formatCurrency(amount, currencyOverride, showPrefix);
}

/**
 * Backward-compatible helper for compact format
 */
export function formatCompactPKR(amount: number, currencyOverride?: string): string {
  return formatCompactCurrency(amount, currencyOverride);
}
