import { UrgencyStatus } from '../types';

export function getNow(): Date {
  return new Date();
}

/**
 * Format date into "16 Sep 2026"
 */
export function formatDate(dateString: string | Date): string {
  if (!dateString) return '—';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Format relative date (e.g. "16 Sep")
 */
export function formatShortDate(dateString: string): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

/**
 * Calculate difference in calendar days between targetDate and reference date
 */
export function getDaysDifference(targetDateString: string, refDate: Date = getNow()): number {
  if (!targetDateString) return 0;
  const target = new Date(targetDateString);
  if (isNaN(target.getTime())) return 0;

  // Normalize both dates to midnight UTC to compare full days
  const targetUtc = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const refUtc = Date.UTC(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());

  const diffMs = targetUtc - refUtc;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Determine urgency status based on days remaining
 * - Expired: < 0 days
 * - Expiring: 0 - 30 days
 * - Safe: > 30 days
 */
export function calculateUrgency(targetDateString: string, refDate: Date = getNow()): UrgencyStatus {
  const days = getDaysDifference(targetDateString, refDate);
  if (days < 0) return 'expired';
  if (days <= 30) return 'expiring';
  return 'safe';
}

/**
 * Human-friendly countdown description
 * e.g., "5 days remaining", "Expires tomorrow", "18 days remaining", "11 months remaining", "Expired 12 days ago"
 */
export function formatRemainingTime(targetDateString: string, refDate: Date = getNow()): string {
  const days = getDaysDifference(targetDateString, refDate);

  if (days < 0) {
    const absDays = Math.abs(days);
    if (absDays === 1) return 'Expired yesterday';
    if (absDays > 365) {
      const years = (absDays / 365).toFixed(1);
      return `Expired ${years} years ago`;
    }
    if (absDays > 30) {
      const months = Math.floor(absDays / 30);
      return `Expired ${months} months ago`;
    }
    return `Expired ${absDays} days ago`;
  }

  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  if (days < 30) return `${days} days remaining`;

  if (days < 365) {
    const months = Math.floor(days / 30);
    return months === 1 ? '1 month remaining' : `${months} months remaining`;
  }

  const years = (days / 365).toFixed(1);
  return `${years} years remaining`;
}

/**
 * Calculate Return Deadline date from purchase date and return window
 */
export function addDaysToDate(dateString: string, days: number): string {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/**
 * Calculate Warranty Expiry date from purchase date and months
 */
export function addMonthsToDate(dateString: string, months: number): string {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

/**
 * Calculate percentage progress between start date and end date
 */
export function getTimelineProgress(startDateString: string, endDateString: string, refDate: Date = getNow()): number {
  const start = new Date(startDateString).getTime();
  const end = new Date(endDateString).getTime();
  const current = refDate.getTime();

  if (isNaN(start) || isNaN(end) || end <= start) return 100;
  if (current <= start) return 0;
  if (current >= end) return 100;

  const total = end - start;
  const elapsed = current - start;
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}
