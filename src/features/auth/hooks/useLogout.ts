import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import * as authApi from '@/lib/api/auth.api';

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Tolerant of network/server failures — always clear local state
    } finally {
      clearAuth();
      queryClient.clear();
      navigate('/login', { replace: true });
    }
  };

  return { logout };
}
