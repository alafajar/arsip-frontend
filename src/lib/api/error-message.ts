import { isAxiosError } from 'axios';

const FALLBACK = 'Terjadi kesalahan. Silakan coba lagi.';

export function getErrorMessage(err: unknown, fallback = FALLBACK): string {
  if (!isAxiosError(err)) return fallback;

  const serverMessage = err.response?.data?.message;
  const hasMessage = typeof serverMessage === 'string' && serverMessage.length > 0;

  if (err.response?.status === 403) {
    return hasMessage ? serverMessage : 'Anda tidak berhak melakukan aksi ini.';
  }

  if (err.response?.status === 409) {
    return hasMessage ? serverMessage : 'Sheet ini tidak dapat diubah (read-only).';
  }

  return hasMessage ? serverMessage : fallback;
}
