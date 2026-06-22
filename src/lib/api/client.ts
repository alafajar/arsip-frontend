import axios, { isAxiosError } from 'axios';
import type { RefreshResponse } from '@/types/api';
import { useAuthStore } from '@/stores/auth.store';

// Extend InternalAxiosRequestConfig agar bisa menyimpan flag _retry
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

// URL yang dikecualikan dari Bearer header dan dari retry-on-401
const AUTH_SKIP = ['/auth/login', '/auth/refresh'] as const;
const isAuthSkip = (url?: string): boolean =>
  AUTH_SKIP.some((skip) => url === skip);

const client = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // agar cookie refresh httpOnly ikut setiap request
});

// ─── Request interceptor ────────────────────────────────────────────────────
// Lampirkan Bearer token dari store — kecuali untuk /auth/login & /auth/refresh
client.interceptors.request.use((config) => {
  if (!isAuthSkip(config.url)) {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── Single-flight refresh ──────────────────────────────────────────────────
// Hanya satu refresh berjalan sekaligus; request lain antre di promise yang sama.
// Penting: rotasi token + reuse-detection di backend → dua refresh paralel
// memicu revoke-all (logout paksa). Satu pintu refresh mencegah ini.
//
// Catatan: memanggil client.post() langsung di sini (bukan via auth.api.ts)
// untuk menghindari circular import (client.ts ↔ auth.api.ts).
let refreshPromise: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = client
      .post<RefreshResponse>('/auth/refresh')
      .then(({ data }) => {
        useAuthStore.getState().setAccessToken(data.accessToken);
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// ─── Response interceptor ───────────────────────────────────────────────────
client.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!isAxiosError(error)) return Promise.reject(error);

    const original = error.config;

    // Lewati jika: bukan 401, config tidak ada, sudah di-retry, atau URL dikecualikan
    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      isAuthSkip(original.url)
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const token = await refreshAccessToken();
      original.headers.Authorization = `Bearer ${token}`;
      return client(original);
    } catch (refreshError) {
      // Refresh gagal (cookie expired/revoked) → bersihkan sesi
      // Redirect ke login ditangani FE-004 (router guard + event)
      useAuthStore.getState().clearAuth();
      return Promise.reject(refreshError);
    }
  },
);

export default client;
