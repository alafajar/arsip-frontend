import client from '@/lib/api/client';
import type { ImportResponse } from '@/types/api';

interface ImportParams {
  file: File;
  name?: string;
  parentMenuId?: string;
}

// FormData is sent without a manual Content-Type header so that the browser
// can set it together with the correct multipart boundary value.
export const importWorkbook = async (params: ImportParams): Promise<ImportResponse> => {
  const formData = new FormData();
  formData.append('file', params.file);
  if (params.name?.trim()) formData.append('name', params.name.trim());
  if (params.parentMenuId) formData.append('parentMenuId', params.parentMenuId);

  const { data } = await client.post<ImportResponse>('/imports', formData);
  return data;
};
