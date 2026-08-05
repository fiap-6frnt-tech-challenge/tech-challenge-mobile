import type { User } from 'firebase/auth';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

import { authService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      authService.subscribe((nextUser) => {
        setUser(nextUser);
        setLoading(false);
      }),
    []
  );

  const value: AuthState = {
    user,
    loading,
    signIn: async (email, password) => {
      await authService.signIn(email, password);
    },
    signUp: async (email, password, name) => {
      await authService.signUp(email, password, name);
    },
    signOut: () => authService.signOut(),
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
