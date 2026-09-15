/**
 * ClaimVault Official Google OAuth 2.0 & Identity Services
 * Manages official Google Sign-In with real browser popups, account selection, and profile retrieval.
 */

export interface GoogleUserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  sub?: string;
}

const DEFAULT_CLIENT_ID = '335830663546-4kt83aj4llal7j70o469snlbubdj9h61.apps.googleusercontent.com';
const SAVED_ACCOUNTS_KEY = 'claimvault_google_saved_accounts_v1';

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
    if (this.isSdkLoaded && (window as any).google?.accounts?.oauth2) {
      return Promise.resolve();
    }

    if (this.sdkLoadingPromise) {
      return this.sdkLoadingPromise;
    }

    this.sdkLoadingPromise = new Promise((resolve, reject) => {
      if ((window as any).google?.accounts?.oauth2) {
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
   * Launches official Google OAuth 2.0 popup to choose an account and sign in
   */
  public async signInWithGoogle(): Promise<GoogleUserProfile> {
    await this.loadGoogleSdk();

    const clientId = this.getClientId();
    const google = (window as any).google;

    if (!google || !google.accounts || !google.accounts.oauth2) {
      throw new Error('Google Sign-In SDK is initializing. Please try again in a moment.');
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
            // Fetch real user info from Google's official userinfo endpoint
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

      // Open official Google OAuth popup
      client.requestAccessToken({ prompt: 'select_account' });
    });
  }

  /**
   * Retrieves saved Google accounts
   */
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

  /**
   * Saves account to recent list
   */
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
