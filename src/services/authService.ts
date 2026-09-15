import { UserProfile } from '../types';
import { storageService, STORAGE_KEYS } from './storageService';
import { emailService } from './emailService';

interface StoredOtp {
  code: string;
  email: string;
  type: 'verification' | 'password_reset';
  expiresAt: number;
}

const OTP_STORAGE_KEY = 'claimvault_auth_otps_v1';
const CREDENTIALS_STORAGE_KEY = 'claimvault_auth_credentials_v1';

class AuthService {
  /**
   * Retrieves all registered email-password credentials
   */
  private getCredentials(): Record<string, string> {
    return storageService.getItem<Record<string, string>>(CREDENTIALS_STORAGE_KEY) || {
      'demo@claimvault.com': 'password123',
    };
  }

  private saveCredentials(creds: Record<string, string>): void {
    storageService.setItem(CREDENTIALS_STORAGE_KEY, creds);
  }

  public getUser(): UserProfile | null {
    const user = storageService.getItem<UserProfile>(STORAGE_KEYS.USER);
    if (user && user.email) {
      return user;
    }
    const legacy = storageService.getItem<UserProfile>(STORAGE_KEYS.LEGACY_USER);
    if (legacy && legacy.email) {
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

    // Verify password if account exists in credentials database
    if (creds[trimmedEmail] && password) {
      if (creds[trimmedEmail] !== password) {
        throw new Error('Incorrect password. Please try again or use Forgot Password.');
      }
    } else if (password) {
      // First-time or demo login - register password
      creds[trimmedEmail] = password;
      this.saveCredentials(creds);
    }

    const rawName = trimmedEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ') || 'User';
    const capitalizedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    
    const existing = storageService.getItem<UserProfile>(STORAGE_KEYS.USER);
    const user: UserProfile = {
      id: existing?.id || `user-${Date.now()}`,
      name: existing?.email?.toLowerCase() === trimmedEmail ? existing.name : capitalizedName,
      email: trimmedEmail,
      avatarUrl: existing?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      currency: existing?.currency || 'PKR',
      isPro: true,
      memberSince: existing?.memberSince || 'September 2026',
      notificationsEnabled: true,
      reminderLeadTimes: [30, 14, 7, 1],
    };
    storageService.setItem(STORAGE_KEYS.USER, user);
    return user;
  }

  public async signup(name: string, email: string, password?: string): Promise<UserProfile> {
    await new Promise((r) => setTimeout(r, 200));
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim() || 'User';

    // Persist password in credentials store
    if (password) {
      const creds = this.getCredentials();
      creds[trimmedEmail] = password;
      this.saveCredentials(creds);
    }

    const user: UserProfile = {
      id: `user-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      currency: 'PKR',
      isPro: true,
      memberSince: 'September 2026',
      notificationsEnabled: true,
      reminderLeadTimes: [30, 14, 7, 1],
    };
    storageService.setItem(STORAGE_KEYS.USER, user);

    // Send welcome confirmation email in background
    emailService.sendWelcomeEmail(trimmedEmail, trimmedName).catch(() => {});

    return user;
  }

  public async loginWithGoogle(googleUser?: { name?: string; email?: string; avatarUrl?: string }): Promise<UserProfile> {
    await new Promise((r) => setTimeout(r, 200));
    const finalEmail = (googleUser?.email || 'abdullah.khan@gmail.com').trim().toLowerCase();
    const finalName = (googleUser?.name || 'Abdullah Khan').trim();
    const finalAvatar = googleUser?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=4285F4&color=fff&bold=true`;

    const existing = storageService.getItem<UserProfile>(STORAGE_KEYS.USER);
    const user: UserProfile = {
      id: existing?.id || `user-google-${Date.now()}`,
      name: finalName,
      email: finalEmail,
      avatarUrl: finalAvatar,
      currency: existing?.currency || 'PKR',
      isPro: true,
      memberSince: existing?.memberSince || 'September 2026',
      notificationsEnabled: true,
      reminderLeadTimes: [30, 14, 7, 1],
    };
    storageService.setItem(STORAGE_KEYS.USER, user);
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
