/**
 * ClaimVault Google OAuth 2.0 & Identity Services Client
 * Manages Google Sign-In with real popup authentication, user profile extraction & fallback configuration.
 */

const GOOGLE_CLIENT_ID_STORAGE_KEY = 'claimvault_google_client_id_v1';

export interface GoogleUserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  sub?: string;
}

class GoogleAuthService {
  private isSdkLoaded = false;
  private sdkLoadingPromise: Promise<void> | null = null;

  public getClientId(): string {
    // 1. Check Vite environment variable
    const envClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    if (envClientId && typeof envClientId === 'string' && envClientId.trim()) {
      return envClientId.trim();
    }

    // 2. Check localStorage custom configuration
    try {
      const stored = localStorage.getItem(GOOGLE_CLIENT_ID_STORAGE_KEY);
      if (stored && stored.trim()) {
        return stored.trim();
      }
    } catch {
      // Ignore storage errors
    }

    return '';
  }

  public setClientId(clientId: string): void {
    if (clientId && clientId.trim()) {
      localStorage.setItem(GOOGLE_CLIENT_ID_STORAGE_KEY, clientId.trim());
    } else {
      localStorage.removeItem(GOOGLE_CLIENT_ID_STORAGE_KEY);
    }
  }

  public hasClientId(): boolean {
    return !!this.getClientId();
  }

  /**
   * Dynamically loads Google Identity Services script if not already present
   */
  public async loadGoogleSdk(): Promise<void> {
    if (this.isSdkLoaded && (window as any).google?.accounts) {
      return Promise.resolve();
    }

    if (this.sdkLoadingPromise) {
      return this.sdkLoadingPromise;
    }

    this.sdkLoadingPromise = new Promise((resolve, reject) => {
      // Check if already in DOM
      if (document.getElementById('google-gsi-client')) {
        this.isSdkLoaded = true;
        resolve();
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
      script.onerror = (err) => {
        this.sdkLoadingPromise = null;
        reject(new Error('Failed to load Google Identity Services SDK'));
      };
      document.head.appendChild(script);
    });

    return this.sdkLoadingPromise;
  }

  /**
   * Triggers the real Google OAuth 2.0 Popup to authenticate user and retrieve real profile info
   */
  public async signInWithGooglePopup(): Promise<GoogleUserProfile> {
    await this.loadGoogleSdk();

    const clientId = this.getClientId();
    if (!clientId) {
      throw new Error('MISSING_CLIENT_ID');
    }

    const google = (window as any).google;
    if (!google || !google.accounts || !google.accounts.oauth2) {
      throw new Error('Google Identity Services SDK is not ready.');
    }

    return new Promise((resolve, reject) => {
      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              reject(new Error(tokenResponse.error_description || tokenResponse.error || 'Google login failed'));
              return;
            }

            try {
              // Fetch user profile from Google's UserInfo API using the access token
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                  Authorization: `Bearer ${tokenResponse.access_token}`,
                },
              });

              if (!res.ok) {
                throw new Error('Failed to retrieve Google user profile');
              }

              const data = await res.json();
              resolve({
                name: data.name || data.given_name || 'Google User',
                email: data.email,
                avatarUrl: data.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=4285F4&color=fff&bold=true`,
                sub: data.sub,
              });
            } catch (fetchErr: any) {
              reject(fetchErr);
            }
          },
          error_callback: (err: any) => {
            reject(new Error(err.message || 'Google Sign-In popup closed or cancelled.'));
          },
        });

        // Prompt Google OAuth popup
        client.requestAccessToken({ prompt: 'select_account' });
      } catch (e: any) {
        reject(e);
      }
    });
  }
}

export const googleAuthService = new GoogleAuthService();
