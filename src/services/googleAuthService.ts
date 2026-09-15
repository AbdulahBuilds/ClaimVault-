/**
 * ClaimVault Google Identity & Account Service
 * Provides Google Account Chooser data, profile persistence, and OAuth utilities.
 */

export interface GoogleUserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  sub?: string;
}

const SAVED_ACCOUNTS_KEY = 'claimvault_google_saved_accounts_v1';

const DEFAULT_ACCOUNTS: GoogleUserProfile[] = [
  {
    name: 'Abdullah Khan',
    email: 'abdullah.khan@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Abdullah Developer',
    email: 'abdullahbuilds.dev@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
];

class GoogleAuthService {
  /**
   * Retrieves all saved Google accounts (including defaults)
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
      // Ignore parse error
    }
    return DEFAULT_ACCOUNTS;
  }

  /**
   * Saves or prepends a newly used Google account
   */
  public saveAccount(account: GoogleUserProfile): void {
    try {
      const current = this.getSavedAccounts();
      const filtered = current.filter(
        (a) => a.email.toLowerCase() !== account.email.toLowerCase()
      );
      const updated = [account, ...filtered].slice(0, 5); // Keep up to 5 accounts
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Helper to format avatar URL
   */
  public getAvatarForName(name: string, seedEmail?: string): string {
    const cleanName = name || 'Google User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=4285F4&color=fff&bold=true`;
  }
}

export const googleAuthService = new GoogleAuthService();

