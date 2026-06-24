import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { CaretLeft, CaretRight, CircleNotch, PencilSimple, Plus, Trash } from '@phosphor-icons/react';
import type { Column as ApiColumn, SheetRow } from '@/types/api';
import { useRows } from '@/features/sheets/hooks/useRows';
import { columnsToColDef } from '@/features/sheets/lib/columns-to-coldef';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

interface SheetTableProps {
  sheetId: string;
  columns: ApiColumn[];
  editMode?: boolean;
  onEditRow?: (row: SheetRow) => void;
  onDeleteRow?: (rowId: string) => void;
  onAddRow?: () => void;
}

const ACTION_BTN =
  'rounded p-1 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]';

export function SheetTable({ sheetId, columns, editMode, onEditRow, onDeleteRow, onAddRow }: SheetTableProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<number>(10);

  const offset = pageIndex * pageSize;
  const { data, isLoading, isFetching, isError } = useRows(sheetId, pageSize, offset);

  const rows: SheetRow[] = data?.rows ?? [];
  const total = data?.total ?? 0;

  const baseColDefs = useMemo(() => columnsToColDef(columns), [columns]);

  const allColDefs = useMemo((): ColumnDef<SheetRow>[] => {
    if (!editMode) return baseColDefs;
    const actionCol: ColumnDef<SheetRow> = {
      id: '__actions',
      header: () => null,
      cell: ({ row }) => (
        <div className="flex justify-end gap-0.5">
          <button type="button" aria-label="Ubah baris" className={ACTION_BTN}
            onClick={() => onEditRow?.(row.original)}>
            <PencilSimple size={13} />
          </button>
          <button type="button" aria-label="Hapus baris" className={ACTION_BTN}
            onClick={() => onDeleteRow?.(row.original.rowId)}>
            <Trash size={13} />
          </button>
        </div>
      ),
    };
    return [...baseColDefs, actionCol];
  }, [baseColDefs, editMode, onEditRow, onDeleteRow]);

  const pageCount = total > 0 ? Math.ceil(total / pageSize) : 1;

  const table = useReactTable({
    data: rows,
    columns: allColDefs,
    pageCount,
    state: { pagination: { pageIndex, pageSize } },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const leafColCount = table.getAllLeafColumns().length;
  const canPrev = pageIndex > 0;
  const canNext = offset + rows.length < total;
  const showStart = total === 0 ? 0 : offset + 1;
  const showEnd = Math.min(offset + pageSize, total);

  if (isError) {
    return (
      <p className="py-8 text-center text-sm text-[var(--destructive)]">
        Gagal memuat baris. Periksa koneksi dan muat ulang.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-x-auto rounded-[var(--radius-lg-val)] border border-[var(--border)]">
        {isFetching && !isLoading && (
          <div className="absolute right-3 top-3 z-10">
            <CircleNotch size={14} className="animate-spin text-[var(--muted-foreground)]" />
          </div>
        )}

        <table className="w-full border-collapse text-sm">
          <thead className="bg-[var(--muted)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    scope={header.colSpan > 1 ? 'colgroup' : 'col'}
                    className="border-b border-r border-[var(--border)] px-3 py-2 text-left text-xs font-semibold text-[var(--muted-foreground)] last:border-r-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className={isFetching && !isLoading ? 'opacity-60 transition-opacity' : ''}>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: leafColCount || 4 }).map((__, j) => (
                      <td key={j} className="border-b border-r border-[var(--border)] px-3 py-2.5 last:border-r-0">
                        <div className="h-4 rounded bg-[var(--border)]" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.length === 0
              ? (
                  <tr>
                    <td colSpan={leafColCount} className="py-12 text-center text-sm text-[var(--muted-foreground)]">
                      Belum ada data.
                    </td>
                  </tr>
                )
              : table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-[var(--muted)]">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="border-b border-r border-[var(--border)] px-3 py-2.5 text-[var(--foreground)] last:border-r-0 last:border-b-0"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>

        {editMode && (
          <div className="border-t border-[var(--border)] px-3 py-2">
            <button
              type="button"
              onClick={onAddRow}
              className="flex items-center gap-1.5 text-xs text-[var(--primary)] hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded"
            >
              <Plus size={13} />
              Tambah baris
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--muted-foreground)]">
        <span>
          {isLoading ? 'Memuat…' : `Menampilkan ${showStart}–${showEnd} dari ${total}`}
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <label htmlFor="pageSize" className="text-xs">Baris per halaman</label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPageIndex(0); }}
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setPageIndex((p) => p - 1)}
              disabled={!canPrev || isLoading} aria-label="Halaman sebelumnya"
              className="flex items-center rounded-[var(--radius)] border border-[var(--border)] px-2 py-1 text-xs hover:bg-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
              <CaretLeft size={12} />
            </button>
            <span className="min-w-[4rem] text-center text-xs">
              {isLoading ? '—' : `${pageIndex + 1} / ${pageCount}`}
            </span>
            <button type="button" onClick={() => setPageIndex((p) => p + 1)}
              disabled={!canNext || isLoading} aria-label="Halaman berikutnya"
              className="flex items-center rounded-[var(--radius)] border border-[var(--border)] px-2 py-1 text-xs hover:bg-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
              <CaretRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
