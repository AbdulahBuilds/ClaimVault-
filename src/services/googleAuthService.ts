/**
 * ClaimVault Official Google OAuth 2.0 & Identity Services
 * Manages Google Sign-In with In-App Google One Tap, Embedded In-App Sign-In, and Profile Retrieval.
 */

export interface GoogleUserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  sub?: string;
}

const DEFAULT_CLIENT_ID = '335830663546-4kt83aj4llal7j70o469snlbubdj9h61.apps.googleusercontent.com';
const SAVED_ACCOUNTS_KEY = 'claimvault_google_saved_accounts_v1';

export function decodeGoogleJwt(credential: string): GoogleUserProfile | null {
  try {
    const base64Url = credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const data = JSON.parse(jsonPayload);
    return {
      name: data.name || data.given_name || 'Google User',
      email: data.email,
      avatarUrl: data.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=4285F4&color=fff&bold=true`,
      sub: data.sub,
    };
  } catch {
    return null;
  }
}

class GoogleAuthService {
  private isSdkLoaded = false;
  private sdkLoadingPromise: Promise<void> | null = null;

  public getClientId(): string {
    const envClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    if (envClientId && typeof envClientId === 'string' && envClientId.trim()) {
      return envClientId.trim();
    }
    return DEFAULT_CLIENT_ID;
  }

  /**
   * Dynamically loads Google Identity Services script
   */
  public async loadGoogleSdk(): Promise<void> {
    if (this.isSdkLoaded && (window as any).google?.accounts?.id) {
      return Promise.resolve();
    }

    if (this.sdkLoadingPromise) {
      return this.sdkLoadingPromise;
    }

    this.sdkLoadingPromise = new Promise((resolve, reject) => {
      if ((window as any).google?.accounts?.id) {
        this.isSdkLoaded = true;
        resolve();
        return;
      }

      const existingScript = document.getElementById('google-gsi-client');
      if (existingScript) {
        existingScript.onload = () => {
          this.isSdkLoaded = true;
          resolve();
        };
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.isSdkLoaded = true;
        resolve();
      };
      script.onerror = () => {
        this.sdkLoadingPromise = null;
        reject(new Error('Failed to connect to Google Identity Services.'));
      };
      document.head.appendChild(script);
    });

    return this.sdkLoadingPromise;
  }

  /**
   * Initializes Google One Tap directly inside the page without external windows
   */
  public async initOneTap(onSuccess: (profile: GoogleUserProfile) => void): Promise<void> {
    try {
      await this.loadGoogleSdk();
      const clientId = this.getClientId();
      const google = (window as any).google;

      if (!google?.accounts?.id) return;

      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          if (response?.credential) {
            const profile = decodeGoogleJwt(response.credential);
            if (profile) {
              this.saveAccount(profile);
              onSuccess(profile);
            }
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Prompt One Tap inside the app viewport
      google.accounts.id.prompt();
    } catch {
      // One Tap silently handles rejection if blocked
    }
  }

  /**
   * Renders Google's official embedded sign-in button directly into any container
   */
  public async renderInAppButton(
    container: HTMLElement,
    onSuccess: (profile: GoogleUserProfile) => void
  ): Promise<void> {
    try {
      await this.loadGoogleSdk();
      const clientId = this.getClientId();
      const google = (window as any).google;

      if (!google?.accounts?.id) return;

      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          if (response?.credential) {
            const profile = decodeGoogleJwt(response.credential);
            if (profile) {
              this.saveAccount(profile);
              onSuccess(profile);
            }
          }
        },
      });

      container.innerHTML = '';
      google.accounts.id.renderButton(container, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        shape: 'pill',
        text: 'continue_with',
        width: 320,
        logo_alignment: 'left',
      });
    } catch {
      // Fallback
    }
  }

  /**
   * Launches official Google OAuth popup as an alternative
   */
  public async signInWithGoogle(): Promise<GoogleUserProfile> {
    await this.loadGoogleSdk();

    const clientId = this.getClientId();
    const google = (window as any).google;

    if (!google?.accounts?.oauth2) {
      throw new Error('Google Sign-In is initializing. Please try again.');
    }

    return new Promise((resolve, reject) => {
      let isSettled = false;

      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        prompt: 'select_account',
        callback: async (tokenResponse: any) => {
          if (isSettled) return;

          if (tokenResponse.error) {
            isSettled = true;
            if (tokenResponse.error === 'access_denied') {
              reject(new Error('Google sign-in was cancelled'));
            } else {
              reject(new Error(tokenResponse.error_description || tokenResponse.error || 'Google login failed'));
            }
            return;
          }

          try {
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            });

            if (!res.ok) {
              throw new Error('Could not fetch user profile from Google');
            }

            const data = await res.json();
            const profile: GoogleUserProfile = {
              name: data.name || data.given_name || 'Google User',
              email: data.email,
              avatarUrl: data.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=4285F4&color=fff&bold=true`,
              sub: data.sub,
            };

            this.saveAccount(profile);
            isSettled = true;
            resolve(profile);
          } catch (err: any) {
            isSettled = true;
            reject(err);
          }
        },
        error_callback: (err: any) => {
          if (!isSettled) {
            isSettled = true;
            reject(new Error(err.message || 'Google Sign-In window closed.'));
          }
        },
      });

      client.requestAccessToken({ prompt: 'select_account' });
    });
  }

  public getSavedAccounts(): GoogleUserProfile[] {
    try {
      const stored = localStorage.getItem(SAVED_ACCOUNTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore
    }
    return [];
  }

  public saveAccount(account: GoogleUserProfile): void {
    try {
      const current = this.getSavedAccounts();
      const filtered = current.filter(
        (a) => a.email.toLowerCase() !== account.email.toLowerCase()
      );
      const updated = [account, ...filtered].slice(0, 5);
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  }

  public getAvatarForName(name: string, seedEmail?: string): string {
    const cleanName = name || 'Google User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=4285F4&color=fff&bold=true`;
  }
}

export const googleAuthService = new GoogleAuthService();
