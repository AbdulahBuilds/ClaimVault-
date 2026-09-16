import { UserProfile } from '../types';
import { storageService, STORAGE_KEYS } from './storageService';
import { emailService } from './emailService';
import { cloudSyncService } from './cloudSyncService';

interface StoredOtp {
  code: string;
  email: string;
  type: 'verification' | 'password_reset';
  expiresAt: number;
}

const OTP_STORAGE_KEY = 'claimvault_auth_otps_v1';
const CREDENTIALS_STORAGE_KEY = 'claimvault_auth_credentials_v1';
const USERS_REGISTRY_KEY = 'claimvault_registered_users_v1';

class AuthService {
  /**
   * Retrieves all registered email-password credentials
   */
  public getCredentials(): Record<string, string> {
    return storageService.getItem<Record<string, string>>(CREDENTIALS_STORAGE_KEY) || {
      'demo@claimvault.com': 'password123',
    };
  }

  public saveCredentials(creds: Record<string, string>): void {
    storageService.setItem(CREDENTIALS_STORAGE_KEY, creds);
  }

  public isEmailRegistered(email: string): boolean {
    const trimmed = email.trim().toLowerCase();
    const creds = this.getCredentials();
    return !!creds[trimmed];
  }

  public async isEmailRegisteredAsync(email: string): Promise<boolean> {
    const trimmed = email.trim().toLowerCase();
    const creds = this.getCredentials();
    if (creds[trimmed]) return true;

    try {
      const cloudUser = await cloudSyncService.fetchUserFromCloud(trimmed);
      if (cloudUser) {
        creds[trimmed] = cloudUser.passwordHash;
        this.saveCredentials(creds);
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }

  private sanitizeAvatar(avatarUrl?: string): string | undefined {
    if (!avatarUrl) return undefined;
    // Strip out legacy default Unsplash placeholders so users get initial letters by default
    if (avatarUrl.includes('images.unsplash.com') || avatarUrl.includes('ui-avatars.com')) {
      return undefined;
    }
    return avatarUrl;
  }

  public getUser(): UserProfile | null {
    const user = storageService.getItem<UserProfile>(STORAGE_KEYS.USER);
    if (user && user.email) {
      if (user.avatarUrl && (user.avatarUrl.includes('images.unsplash.com') || user.avatarUrl.includes('ui-avatars.com'))) {
        user.avatarUrl = undefined;
        storageService.setItem(STORAGE_KEYS.USER, user);
      }
      return user;
    }
    const legacy = storageService.getItem<UserProfile>(STORAGE_KEYS.LEGACY_USER);
    if (legacy && legacy.email) {
      if (legacy.avatarUrl && (legacy.avatarUrl.includes('images.unsplash.com') || legacy.avatarUrl.includes('ui-avatars.com'))) {
        legacy.avatarUrl = undefined;
      }
      storageService.setItem(STORAGE_KEYS.USER, legacy);
      return legacy;
    }
    return null;
  }

  public isOnboardingCompleted(): boolean {
    const val = storageService.getItem<boolean>(STORAGE_KEYS.ONBOARDING) ?? 
      (storageService.getItem<string>(STORAGE_KEYS.LEGACY_ONBOARDING) === 'true');
    return !!val;
  }

  public setOnboardingCompleted(completed: boolean): void {
    storageService.setItem(STORAGE_KEYS.ONBOARDING, completed);
  }

  public async login(email: string, password?: string): Promise<UserProfile> {
    await new Promise((r) => setTimeout(r, 200));
    const trimmedEmail = email.trim().toLowerCase();
    const creds = this.getCredentials();

    // 1. If not found in local credentials, check Supabase Cloud for cross-device support
    if (!creds[trimmedEmail]) {
      try {
        const cloudData = await cloudSyncService.fetchUserFromCloud(trimmedEmail);
        if (cloudData) {
          creds[trimmedEmail] = cloudData.passwordHash;
          this.saveCredentials(creds);

          const registeredUsers = storageService.getItem<Record<string, UserProfile>>(USERS_REGISTRY_KEY) || {};
          registeredUsers[trimmedEmail] = cloudData.user;
          storageService.setItem(USERS_REGISTRY_KEY, registeredUsers);
        }
      } catch (err) {
        console.warn('[AuthService] Error checking cloud user during login:', err);
      }
    }

    // 2. Strict Check: If email is still not found, deny access
    if (!creds[trimmedEmail]) {
      throw new Error('No account found with this email address. Please click "Create Account" below to register.');
    }

    // 3. Strict Check: Verify password
    if (password && creds[trimmedEmail] !== password) {
      throw new Error('Incorrect password. Please verify your password or use "Forgot password?".');
    }

    const registeredUsers = storageService.getItem<Record<string, UserProfile>>(USERS_REGISTRY_KEY) || {};
    const existing = registeredUsers[trimmedEmail];

    const rawName = trimmedEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ') || 'User';
    const capitalizedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    
    const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const user: UserProfile = existing || {
      id: `user-${Date.now()}`,
      name: capitalizedName,
      email: trimmedEmail,
      avatarUrl: undefined,
      currency: 'PKR',
      isPro: true,
      memberSince: currentMonthYear,
      notificationsEnabled: true,
      reminderLeadTimes: [30, 14, 7, 1],
    };

    storageService.setItem(STORAGE_KEYS.USER, user);

    // Sync user state to Supabase in background
    cloudSyncService.syncUserToCloud(user, creds[trimmedEmail]).catch(() => {});

    return user;
  }

  public async signup(name: string, email: string, password?: string): Promise<UserProfile> {
    await new Promise((r) => setTimeout(r, 200));
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim() || 'User';
    const creds = this.getCredentials();

    if (creds[trimmedEmail]) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    // Check Supabase Cloud if account already exists on another device
    try {
      const cloudData = await cloudSyncService.fetchUserFromCloud(trimmedEmail);
      if (cloudData) {
        throw new Error('An account with this email address already exists. Please sign in instead.');
      }
    } catch (e: any) {
      if (e.message && e.message.includes('already exists')) {
        throw e;
      }
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    creds[trimmedEmail] = password;
    this.saveCredentials(creds);

    const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const user: UserProfile = {
      id: `user-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      avatarUrl: undefined,
      currency: 'PKR',
      isPro: true,
      memberSince: currentMonthYear,
      notificationsEnabled: true,
      reminderLeadTimes: [30, 14, 7, 1],
    };

    const registeredUsers = storageService.getItem<Record<string, UserProfile>>(USERS_REGISTRY_KEY) || {};
    registeredUsers[trimmedEmail] = user;
    storageService.setItem(USERS_REGISTRY_KEY, registeredUsers);

    storageService.setItem(STORAGE_KEYS.USER, user);

    // Sync account to Supabase Cloud
    await cloudSyncService.syncUserToCloud(user, password);

    // Send welcome confirmation email in background
    emailService.sendWelcomeEmail(trimmedEmail, trimmedName).catch(() => {});

    return user;
  }

  public async syncAllLocalDataToCloud(): Promise<void> {
    const creds = this.getCredentials();
    const registeredUsers = storageService.getItem<Record<string, UserProfile>>(USERS_REGISTRY_KEY) || {};
    
    for (const [email, user] of Object.entries(registeredUsers)) {
      const password = creds[email];
      if (user && user.email) {
        await cloudSyncService.syncUserToCloud(user, password);
      }
    }

    const currentUser = this.getUser();
    if (currentUser && currentUser.email) {
      const password = creds[currentUser.email.toLowerCase().trim()];
      await cloudSyncService.syncUserToCloud(currentUser, password);
    }
  }

  public async loginWithGoogle(googleUser?: { name?: string; email?: string; avatarUrl?: string }): Promise<UserProfile> {
    await new Promise((r) => setTimeout(r, 200));
    const finalEmail = (googleUser?.email || 'user@gmail.com').trim().toLowerCase();
    const finalName = (googleUser?.name || 'Google User').trim();
    const finalAvatar = this.sanitizeAvatar(googleUser?.avatarUrl);

    const creds = this.getCredentials();
    if (!creds[finalEmail]) {
      creds[finalEmail] = `google_oauth_${Date.now()}`;
      this.saveCredentials(creds);
    }

    const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const registeredUsers = storageService.getItem<Record<string, UserProfile>>(USERS_REGISTRY_KEY) || {};
    const existing = registeredUsers[finalEmail] || storageService.getItem<UserProfile>(STORAGE_KEYS.USER);

    const user: UserProfile = {
      id: existing?.id || `user-google-${Date.now()}`,
      name: finalName,
      email: finalEmail,
      avatarUrl: finalAvatar,
      currency: existing?.currency || 'PKR',
      isPro: true,
      memberSince: existing?.memberSince || currentMonthYear,
      notificationsEnabled: true,
      reminderLeadTimes: [30, 14, 7, 1],
    };

    registeredUsers[finalEmail] = user;
    storageService.setItem(USERS_REGISTRY_KEY, registeredUsers);

    storageService.setItem(STORAGE_KEYS.USER, user);

    // Sync Google account to Supabase Cloud
    cloudSyncService.syncUserToCloud(user, creds[finalEmail]).catch(() => {});

    return user;
  }

  public async logout(): Promise<void> {
    await new Promise((r) => setTimeout(r, 100));
    storageService.removeItem(STORAGE_KEYS.USER);
    storageService.removeItem(STORAGE_KEYS.LEGACY_USER);
  }

  // ==========================================
  // OTP & EMAIL VERIFICATION / PASSWORD RESET
  // ==========================================

  private generate6DigitCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private saveOtp(email: string, code: string, type: 'verification' | 'password_reset'): void {
    const otps: StoredOtp[] = storageService.getItem<StoredOtp[]>(OTP_STORAGE_KEY) || [];
    const filtered = otps.filter(
      (o) => !(o.email.toLowerCase() === email.toLowerCase() && o.type === type)
    );
    const newOtp: StoredOtp = {
      email: email.toLowerCase().trim(),
      code: code.trim(),
      type,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    };
    storageService.setItem(OTP_STORAGE_KEY, [...filtered, newOtp]);
  }

  /**
   * Generates and dispatches a password recovery OTP to the user's email via Brevo
   */
  public async requestPasswordResetOtp(email: string): Promise<{ success: boolean; code: string; isSimulated?: boolean }> {
    const trimmed = email.trim().toLowerCase();
    const code = this.generate6DigitCode();
    this.saveOtp(trimmed, code, 'password_reset');

    const result = await emailService.sendPasswordResetOtp(trimmed, code);
    return {
      success: true,
      code,
      isSimulated: result.isSimulated,
    };
  }

  /**
   * Verifies the 6-digit OTP entered by the user
   */
  public verifyPasswordResetOtp(email: string, enteredCode: string): boolean {
    const trimmed = email.trim().toLowerCase();
    const code = enteredCode.trim();
    const otps: StoredOtp[] = storageService.getItem<StoredOtp[]>(OTP_STORAGE_KEY) || [];

    const found = otps.find(
      (o) =>
        o.email === trimmed &&
        o.type === 'password_reset' &&
        o.code === code &&
        o.expiresAt > Date.now()
    );

    return !!found;
  }

  /**
   * Resets and updates the account password in the persistent credentials database
   */
  public async completePasswordReset(email: string, newPassword: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 300));
    const trimmed = email.trim().toLowerCase();

    // 1. Update persistent credentials database with the new password
    const creds = this.getCredentials();
    creds[trimmed] = newPassword;
    this.saveCredentials(creds);

    // 2. Clear used OTPs
    const otps: StoredOtp[] = storageService.getItem<StoredOtp[]>(OTP_STORAGE_KEY) || [];
    const remaining = otps.filter(
      (o) => !(o.email === trimmed && o.type === 'password_reset')
    );
    storageService.setItem(OTP_STORAGE_KEY, remaining);

    // 3. Update active user profile if currently signed in with this email
    const current = storageService.getItem<UserProfile>(STORAGE_KEYS.USER);
    if (current && current.email?.toLowerCase() === trimmed) {
      storageService.setItem(STORAGE_KEYS.USER, current);
      cloudSyncService.syncUserToCloud(current, newPassword).catch(() => {});
    } else {
      const registeredUsers = storageService.getItem<Record<string, UserProfile>>(USERS_REGISTRY_KEY) || {};
      const regUser = registeredUsers[trimmed];
      if (regUser) {
        cloudSyncService.syncUserToCloud(regUser, newPassword).catch(() => {});
      }
    }

    return true;
  }

  /**
   * Generates and dispatches an account verification OTP
   */
  public async requestAccountVerificationOtp(email: string, name?: string): Promise<{ success: boolean; code: string; isSimulated?: boolean }> {
    const trimmed = email.trim().toLowerCase();
    const code = this.generate6DigitCode();
    this.saveOtp(trimmed, code, 'verification');

    const result = await emailService.sendAccountVerificationOtp(trimmed, code, name);
    return {
      success: true,
      code,
      isSimulated: result.isSimulated,
    };
  }

  public verifyAccountOtp(email: string, enteredCode: string): boolean {
    const trimmed = email.trim().toLowerCase();
    const code = enteredCode.trim();
    const otps: StoredOtp[] = storageService.getItem<StoredOtp[]>(OTP_STORAGE_KEY) || [];

    const found = otps.find(
      (o) =>
        o.email === trimmed &&
        o.type === 'verification' &&
        o.code === code &&
        o.expiresAt > Date.now()
    );

    return !!found;
  }
}

export const authService = new AuthService();
