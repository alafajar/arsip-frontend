// Factory key TanStack Query — akan diisi per-feature di stage berikutnya
export const queryKeys = {
  menus: {
    all: () => ['menus'] as const,
  },
  sheets: {
    all: () => ['sheets'] as const,
    meta: (sheetId: string) => ['sheets', sheetId, 'meta'] as const,
    rows: (sheetId: string) => ['sheets', sheetId, 'rows'] as const,
  },
} as const;
