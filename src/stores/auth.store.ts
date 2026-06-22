import { create } from 'zustand';
import type { ApiUser } from '@/types/api';

interface AuthState {
  accessToken: string | null;
  user: ApiUser | null;
  setAuth: (token: string, user: ApiUser) => void;
  setAccessToken: (token: string) => void;
  setUser: (user: ApiUser) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,

  setAuth: (token, user) => set({ accessToken: token, user }),
  setAccessToken: (token) => set({ accessToken: token }),
  setUser: (user) => set({ user }),
  clearAuth: () => set({ accessToken: null, user: null }),

  // getter via getState() aman dipanggil di luar React (interceptor, bootstrap)
  isAuthenticated: () => !!get().accessToken,
}));
