import client from './client';
import type { LoginResponse, RefreshResponse, MeResponse } from '@/types/api';

export const login = async (
  username: string,
  password: string,
): Promise<LoginResponse> => {
  const { data } = await client.post<LoginResponse>('/auth/login', {
    username,
    password,
  });
  return data;
};

// Andalkan cookie httpOnly; tanpa body, tanpa Bearer (dikecualikan di interceptor)
export const refresh = async (): Promise<RefreshResponse> => {
  const { data } = await client.post<RefreshResponse>('/auth/refresh');
  return data;
};

// Butuh Bearer — mengikut request interceptor otomatis
export const logout = async (): Promise<void> => {
  await client.post('/auth/logout');
};

export const me = async (): Promise<MeResponse> => {
  const { data } = await client.get<MeResponse>('/auth/me');
  return data;
};
