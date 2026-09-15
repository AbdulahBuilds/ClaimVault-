import { UserProfile } from '../types';
import { INITIAL_USER_PROFILE } from '../data/mockProducts';
import { storageService, STORAGE_KEYS } from './storageService';

class AuthService {
  public getUser(): UserProfile | null {
    const user = storageService.getItem<UserProfile>(STORAGE_KEYS.USER);
    if (user) {
      return user;
    }
    const legacy = storageService.getItem<UserProfile>(STORAGE_KEYS.LEGACY_USER);
    if (legacy) {
      storageService.setItem(STORAGE_KEYS.USER, legacy);
      return legacy;
    }
    return INITIAL_USER_PROFILE;
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
    await new Promise((r) => setTimeout(r, 300));
    const current = this.getUser() || INITIAL_USER_PROFILE;
    const user: UserProfile = {
      ...current,
      email: email || current.email,
      name: email ? email.split('@')[0].replace(/[^a-zA-Z]/g, ' ') : current.name,
    };
    storageService.setItem(STORAGE_KEYS.USER, user);
    return user;
  }

  public async signup(name: string, email: string, _password?: string): Promise<UserProfile> {
    await new Promise((r) => setTimeout(r, 300));
    const user: UserProfile = {
      ...INITIAL_USER_PROFILE,
      id: `user-${Date.now()}`,
      name: name || 'Abdullah',
      email: email || 'abdullah@example.com',
      memberSince: 'September 2026',
    };
    storageService.setItem(STORAGE_KEYS.USER, user);
    return user;
  }

  public async logout(): Promise<void> {
    await new Promise((r) => setTimeout(r, 150));
    storageService.removeItem(STORAGE_KEYS.USER);
  }
}

export const authService = new AuthService();
