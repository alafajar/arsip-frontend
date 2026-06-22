import { refresh, me } from '@/lib/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiUser } from '@/types/api';

/**
 * Pulihkan sesi setelah reload:
 *   1. POST /auth/refresh → dapatkan access token baru (via cookie httpOnly)
 *   2. GET  /auth/me      → dapatkan identitas user
 *
 * Dipanggil satu kali saat app boot. Wiring ke router ada di FE-004.
 * Return true = sesi berhasil dipulihkan; false = tidak ada sesi aktif.
 */
export async function bootstrapAuth(): Promise<boolean> {
  try {
    const { accessToken } = await refresh();
    useAuthStore.getState().setAccessToken(accessToken);

    const meData = await me();
    // /me tidak mengembalikan fullName → fallback ke username agar ApiUser lengkap
    const user: ApiUser = { ...meData, fullName: meData.username };
    useAuthStore.getState().setUser(user);

    return true;
  } catch {
    useAuthStore.getState().clearAuth();
    return false;
  }
}
