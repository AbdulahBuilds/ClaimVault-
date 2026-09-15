import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';
import { authService } from '../services/authService';

import { storageService, STORAGE_KEYS } from '../services/storageService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isOnboardingCompleted: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (name: string, email: string, password?: string) => Promise<void>;
  loginWithGoogle: (googleUser?: { name?: string; email?: string; avatarUrl?: string }) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => authService.getUser());
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(() => authService.isOnboardingCompleted());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Re-verify in background on mount
    const currentUser = authService.getUser();
    const onboardingDone = authService.isOnboardingCompleted();
    setUser(currentUser);
    setIsOnboardingCompleted(onboardingDone);
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const authenticatedUser = await authService.login(email, password);
      setUser(authenticatedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password?: string) => {
    setIsLoading(true);
    try {
      const newUser = await authService.signup(name, email, password);
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (googleUser?: { name?: string; email?: string; avatarUrl?: string }) => {
    setIsLoading(true);
    try {
      const user = await authService.loginWithGoogle(googleUser);
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = () => {
    authService.setOnboardingCompleted(true);
    setIsOnboardingCompleted(true);
  };

  const resetOnboarding = () => {
    authService.setOnboardingCompleted(false);
    setIsOnboardingCompleted(false);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    storageService.setItem(STORAGE_KEYS.USER, updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isOnboardingCompleted,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        logout,
        completeOnboarding,
        resetOnboarding,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
