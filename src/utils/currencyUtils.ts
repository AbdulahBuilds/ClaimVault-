/**
 * Format a number into Pakistani Rupee (PKR / Rs.) format with commas
 * e.g., 74999 -> "Rs. 74,999"
 */
export function formatPKR(amount: number, showPrefix: boolean = true): string {
  if (isNaN(amount)) return showPrefix ? 'Rs. 0' : '0';
  
  // Format with standard thousands separators
  const formatted = new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0,
  }).format(amount);

  return showPrefix ? `Rs. ${formatted}` : formatted;
}

/**
 * Format large amounts into compact representation (e.g. Rs. 1.2M, Rs. 590K)
 */
export function formatCompactPKR(amount: number): string {
  if (amount >= 1000000) {
    return `Rs. ${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `Rs. ${(amount / 1000).toFixed(0)}K`;
  }
  return formatPKR(amount);
}
