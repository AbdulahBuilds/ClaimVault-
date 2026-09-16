/**
 * ClaimVault Device Notification Service
 * Handles native OS/device push notifications, Service Worker registration,
 * Web Audio sound alerts, and permission management across Desktop & Mobile.
 */

export type DevicePermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export interface DeviceNotificationPayload {
  title: string;
  body: string;
  tag?: string;
  icon?: string;
  badge?: string;
  url?: string;
  sound?: boolean;
}

class DeviceNotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isInitialized = false;

  /**
   * Register the Service Worker for background push and device notifications
   */
  public async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      this.swRegistration = registration;
      this.isInitialized = true;

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[ClaimVault SW] New content available; updating...');
            }
          });
        }
      });

      return registration;
    } catch (err) {
      console.warn('[ClaimVault SW] Service Worker registration failed:', err);
      return null;
    }
  }

  /**
   * Get current device notification permission status
   */
  public getPermissionStatus(): DevicePermissionStatus {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission as DevicePermissionStatus;
  }

  /**
   * Request native browser/OS permission for device notifications
   */
  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      return result === 'granted';
    } catch (error) {
      console.warn('[ClaimVault Notification] Permission request error:', error);
      return false;
    }
  }

  /**
   * Synthesize a clean, native-feeling notification chime using Web Audio API
   */
  public playChime(): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Crisp 2-tone melodic chime: E6 (1318.5 Hz) -> B6 (1975.5 Hz)
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(1318.5, now);
      osc.frequency.setValueAtTime(1975.5, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Audio playback restrictions fallback gracefully
    }
  }

  /**
   * Send a real OS/Device system notification (Windows Action Center, Android Tray, Mac Notification Center, iOS PWA)
   */
  public async sendDeviceNotification(
    payload: DeviceNotificationPayload
  ): Promise<{ success: boolean; method: string; message: string }> {
    if (typeof window === 'undefined') {
      return { success: false, method: 'none', message: 'Window is undefined' };
    }

    if (!('Notification' in window)) {
      return {
        success: false,
        method: 'unsupported',
        message: 'Notifications are not supported by this browser.',
      };
    }

    // Auto-request permission if currently 'default' (user initiated)
    let currentPermission = Notification.permission;
    if (currentPermission === 'default') {
      const granted = await this.requestPermission();
      currentPermission = granted ? 'granted' : 'denied';
    }

    if (currentPermission !== 'granted') {
      return {
        success: false,
        method: 'permission_denied',
        message: 'Device notification permission is not granted in browser settings.',
      };
    }

    // Play pleasant chime
    if (payload.sound !== false) {
      this.playChime();
    }

    const iconUrl = payload.icon || '/claimvault-logo.png';
    const badgeUrl = payload.badge || '/claimvault-logo.png';
    const tag = payload.tag || `cv-${Date.now()}`;

    // 1. Try Service Worker showNotification (Best for Desktop & Android & PWA)
    if ('serviceWorker' in navigator) {
      try {
        let registration = this.swRegistration;
        if (!registration) {
          registration = await navigator.serviceWorker.getRegistration();
        }
        if (!registration) {
          registration = await this.registerServiceWorker();
        }

        if (registration && 'showNotification' in registration) {
          await registration.showNotification(payload.title, {
            body: payload.body,
            icon: iconUrl,
            badge: badgeUrl,
            tag,
            vibrate: [200, 100, 200],
            data: {
              url: payload.url || window.location.origin,
              timestamp: Date.now(),
            },
            // Android / Chrome action button
            actions: [
              {
                action: 'open',
                title: 'Open ClaimVault',
              },
            ],
          } as NotificationOptions);

          return {
            success: true,
            method: 'serviceWorker',
            message: 'Device notification delivered via Service Worker to system tray.',
          };
        }
      } catch (swErr) {
        console.warn('[ClaimVault Notification] SW showNotification error:', swErr);
      }
    }

    // 2. Fallback to standard window.Notification API
    try {
      const notif = new Notification(payload.title, {
        body: payload.body,
        icon: iconUrl,
        badge: badgeUrl,
        tag,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };

      return {
        success: true,
        method: 'notificationApi',
        message: 'Device notification delivered via Notification API to system tray.',
      };
    } catch (apiErr) {
      console.error('[ClaimVault Notification] Notification constructor error:', apiErr);
      return {
        success: false,
        method: 'error',
        message: 'Could not display device notification.',
      };
    }
  }
}

export const deviceNotificationService = new DeviceNotificationService();
