import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import * as authApi from '@/lib/api/auth.api';

export type LoginError = 'credentials' | 'rate-limited' | null;

export interface UseLoginReturn {
  submit: (username: string, password: string) => Promise<void>;
  isLoading: boolean;
  loginError: LoginError;
  clearError: () => void;
}

export function useLogin(): UseLoginReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<LoginError>(null);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const submit = async (username: string, password: string) => {
    setIsLoading(true);
    setLoginError(null);
    try {
      const { accessToken, user } = await authApi.login(username, password);
      setAuth(accessToken, user);
      navigate('/');
    } catch (err) {
      if (isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) {
          setLoginError('credentials');
        } else if (status === 429) {
          setLoginError('rate-limited');
        } else {
          toast.error('Terjadi kesalahan. Silakan coba lagi.');
        }
      } else {
        toast.error('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submit,
    isLoading,
    loginError,
    clearError: () => setLoginError(null),
  };
}
