import { useAuthStore } from '@/stores/auth.store';

// UI convenience only — hides write actions for KAPRODI.
// Real authorization lives in the backend (403). Always handle 403 in API calls.
export function useCanEdit(): boolean {
  return useAuthStore((s) => s.user?.role === 'ADMIN') ?? false;
}
