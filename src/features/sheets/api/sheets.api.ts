import client from '@/lib/api/client';
import type { SheetMeta, Column, RowsResponse } from '@/types/api';

export const getSheet = async (id: string): Promise<SheetMeta> => {
  const { data } = await client.get<SheetMeta>(`/sheets/${id}`);
  return data;
};

export const getColumns = async (id: string): Promise<Column[]> => {
  const { data } = await client.get<Column[]>(`/sheets/${id}/columns`);
  return data;
};

export const getRows = async (
  id: string,
  limit: number,
  offset: number,
): Promise<RowsResponse> => {
  const { data } = await client.get<RowsResponse>(`/sheets/${id}/rows`, {
    params: { limit, offset },
  });
  return data;
};
