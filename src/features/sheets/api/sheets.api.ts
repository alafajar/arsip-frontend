import client from '@/lib/api/client';
import type { SheetMeta, Column, RowsResponse, SheetRow, RowWriteBody } from '@/types/api';

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

export const createRow = async (sheetId: string, body: RowWriteBody): Promise<SheetRow> => {
  const { data } = await client.post<SheetRow>(`/sheets/${sheetId}/rows`, body);
  return data;
};

export const updateRow = async (
  sheetId: string,
  rowId: string,
  body: RowWriteBody,
): Promise<SheetRow> => {
  const { data } = await client.patch<SheetRow>(`/sheets/${sheetId}/rows/${rowId}`, body);
  return data;
};

export const deleteRow = async (sheetId: string, rowId: string): Promise<void> => {
  await client.delete(`/sheets/${sheetId}/rows/${rowId}`);
};
