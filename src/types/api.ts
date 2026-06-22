// ---- Roles ----
export type Role = 'ADMIN' | 'KAPRODI';

// ---- Auth ----
export interface ApiUser {
  id: string;
  username: string;
  fullName?: string; // HANYA ada di response login; /me & /refresh tidak mengembalikannya
  role: Role;
}
export interface LoginResponse {
  accessToken: string;
  user: ApiUser; // berisi fullName
}
export interface MeResponse {
  id: string;
  username: string;
  role: Role; // tanpa fullName → fallback ke username di UI
}
export interface RefreshResponse {
  accessToken: string;
}

// ---- Menu (Map) ----
export interface MenuSheetRef { id: string; name: string }
export interface MenuNode {
  id: string;
  name: string;
  orderIndex: number;
  sheets: MenuSheetRef[];
  children: MenuNode[];
}

// ---- Sheet ----
// 7 tipe kolom backend: TEXT, INTEGER, FLOAT, DATE, BOOLEAN, MARKING, URL
export type ColumnType = 'TEXT' | 'INTEGER' | 'FLOAT' | 'DATE' | 'BOOLEAN' | 'MARKING' | 'URL';

export interface SheetMeta {
  id: string;
  name: string;
  orderIndex: number;
  isReadOnly: boolean;
  menuItem: { id: string; name: string };
}
export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  orderIndex: number;
  children: Column[]; // non-leaf = header grup (datanya null di rows), leaf = pembawa data
}
export interface SheetRow {
  rowId: string;                        // perhatikan: rowId, bukan id
  orderIndex: number;
  cells: Record<string, string | null>; // columnId -> value; SELALU string|null (termasuk INTEGER/URL)
}
export interface RowsResponse {
  rows: SheetRow[];
  total: number;
  limit: number;
  offset: number;
}

// ---- Row write ----
export interface CellWrite { columnId: string; value: string } // value:"" = HAPUS cell (delete-on-empty)
export interface RowWriteBody { cells: CellWrite[] }

// ---- Import ----
export interface ImportedSheet { sheetId: string; name: string; isReadOnly: boolean }
export interface ImportResponse {
  importId: string;
  workbookMenuId: string;
  sheets: ImportedSheet[];
}
