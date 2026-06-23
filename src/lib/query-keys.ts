// Factory key TanStack Query — akan diisi per-feature di stage berikutnya
export const queryKeys = {
  menus: {
    all: () => ['menus'] as const,
  },
  sheets: {
    all: () => ['sheets'] as const,
    meta: (sheetId: string) => ['sheets', sheetId, 'meta'] as const,
    columns: (sheetId: string) => ['sheets', sheetId, 'columns'] as const,
    // base rows key (for invalidation)
    rows: (sheetId: string) => ['sheets', sheetId, 'rows'] as const,
    // per-page key (limit/offset included so different pages cache separately)
    rowsPage: (sheetId: string, limit: number, offset: number) =>
      ['sheets', sheetId, 'rows', limit, offset] as const,
  },
} as const;
