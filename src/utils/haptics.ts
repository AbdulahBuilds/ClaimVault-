/**
 * ClaimVault Haptic Feedback Utility
 * Provides subtle tactile feedback on mobile devices supporting the Navigator Vibration API.
 */

export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

export const triggerHaptic = (type: HapticType = 'light'): void => {
  if (typeof window === 'undefined' || !('navigator' in window) || !navigator.vibrate) {
    return;
  }

  try {
    switch (type) {
      case 'light':
      case 'selection':
        navigator.vibrate(8);
        break;
      case 'medium':
        navigator.vibrate(18);
        break;
      case 'heavy':
        navigator.vibrate(35);
        break;
      case 'success':
        navigator.vibrate([10, 30, 20]);
        break;
      case 'warning':
        navigator.vibrate([20, 50, 20]);
        break;
      case 'error':
        navigator.vibrate([30, 40, 30, 40, 50]);
        break;
      default:
        navigator.vibrate(10);
    }
  } catch {
    // Ignore unsupported browser environments
  }
};
