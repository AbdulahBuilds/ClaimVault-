import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { currencyService } from '../services/currencyService';
import { 
  SUPPORTED_CURRENCIES, 
  CurrencyInfo, 
  formatCurrency, 
  formatProductPrice,
  formatCompactCurrency, 
  convertCurrency,
  getCurrencySymbol, 
  CURRENCY_LIST 
} from '../utils/currencyUtils';

export function useCurrency() {
  const { user } = useAuth();
  const currentCurrency = (user?.currency || 'PKR').toUpperCase();
  const currencyInfo: CurrencyInfo = SUPPORTED_CURRENCIES[currentCurrency] || SUPPORTED_CURRENCIES.PKR;
  const symbol = getCurrencySymbol(currentCurrency);

  const [, setRatesVersion] = useState<number>(0);

  // Subscribe to live rate updates
  useEffect(() => {
    const unsubscribe = currencyService.subscribe(() => {
      setRatesVersion((v) => v + 1);
    });
    return () => unsubscribe();
  }, []);

  const format = (amount: number, overrideCurrency?: string, showPrefix: boolean = true, fromCurrency?: string) => {
    return formatCurrency(amount, overrideCurrency || currentCurrency, showPrefix, fromCurrency);
  };

  const formatPrice = (price: number, productCurrency?: string, overrideTargetCurrency?: string) => {
    return formatProductPrice(price, productCurrency, overrideTargetCurrency || currentCurrency);
  };

  const formatCompact = (amount: number, overrideCurrency?: string, fromCurrency?: string) => {
    return formatCompactCurrency(amount, overrideCurrency || currentCurrency, fromCurrency);
  };

  const convert = (amount: number, fromCurrency?: string, toCurrency?: string) => {
    return convertCurrency(amount, fromCurrency, toCurrency || currentCurrency);
  };

  const refreshLiveRates = async (force: boolean = true) => {
    return currencyService.fetchLiveRates(force);
  };

  return {
    currency: currentCurrency,
    currencyInfo,
    symbol,
    format,
    formatPrice,
    formatCompact,
    convert,
    refreshLiveRates,
    lastUpdated: currencyService.getLastUpdatedDate(),
    currencyList: CURRENCY_LIST,
  };
}
