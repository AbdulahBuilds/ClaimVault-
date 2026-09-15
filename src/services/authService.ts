import { UserProfile } from '../types';
import { storageService, STORAGE_KEYS } from './storageService';

class AuthService {
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

  public async login(email: string, _password?: string): Promise<UserProfile> {
    await new Promise((r) => setTimeout(r, 200));
    const trimmedEmail = email.trim().toLowerCase();
    const rawName = trimmedEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ') || 'User';
    const capitalizedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    
    // Check if existing profile in storage matches
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

  public async signup(name: string, email: string, _password?: string): Promise<UserProfile> {
    await new Promise((r) => setTimeout(r, 200));
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim() || 'User';
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
    return user;
  }

  public async logout(): Promise<void> {
    await new Promise((r) => setTimeout(r, 100));
    storageService.removeItem(STORAGE_KEYS.USER);
    storageService.removeItem(STORAGE_KEYS.LEGACY_USER);
  }
}

export const authService = new AuthService();

