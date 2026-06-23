import type { ColumnDef } from '@tanstack/react-table';
import type { Column as ApiColumn, SheetRow } from '@/types/api';
import { CellRenderer } from '@/features/sheets/components/CellRenderer';

// Recursively maps the backend Column tree into TanStack Table ColumnDefs.
//
// Group node (has children) → ColumnDef with `columns` sub-array, NO accessor.
// Attaching an accessor to a group column is wrong: group ids always appear as null
// in rows; the data lives only in leaves. A group def without an accessor tells
// TanStack Table to render spanning header cells and skip value extraction.
//
// Leaf node (no children) → ColumnDef with accessorFn reading cells[col.id].
export function columnsToColDef(columns: ApiColumn[]): ColumnDef<SheetRow>[] {
  return [...columns]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((col): ColumnDef<SheetRow> => {
      if (col.children.length > 0) {
        return {
          id: col.id,
          header: col.name,
          columns: columnsToColDef(col.children),
        };
      }

      const colType = col.type;
      return {
        id: col.id,
        accessorFn: (row: SheetRow): string | null => row.cells[col.id] ?? null,
        header: col.name,
        cell: ({ getValue }) => (
          <CellRenderer value={getValue() as string | null} type={colType} />
        ),
      };
    });
}
