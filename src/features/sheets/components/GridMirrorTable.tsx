import { useMemo } from 'react';
import { CircleNotch } from '@phosphor-icons/react';
import type { Column as ApiColumn, CellMerge, SheetRow } from '@/types/api';
import { useRows } from '@/features/sheets/hooks/useRows';
import { buildMergeIndex } from '@/features/sheets/lib/grid-merges';
import { cn } from '@/lib/utils';

// Grid-mirror dirender utuh tanpa paginasi agar setia dengan Excel: band header
// (baris-baris ter-merge di atas) harus selalu tampak bersama datanya, dan rowSpan
// lintas-halaman akan rusak bila dipaginasi. MAX_ROWS = batas limit backend.
const MAX_ROWS = 200;

const URL_RE = /^https?:\/\//i;

interface GridMirrorTableProps {
  sheetId: string;
  columns: ApiColumn[];
  merges: CellMerge[];
}

function renderCellValue(value: string | null) {
  // Sel kosong = kosong (setia Excel), bukan "—". Guard non-string untuk data lama.
  if (value === null || value === '' || typeof value !== 'string') return null;
  if (URL_RE.test(value)) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-[var(--primary)] underline underline-offset-2 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        {value}
      </a>
    );
  }
  return value;
}

export function GridMirrorTable({ sheetId, columns, merges }: GridMirrorTableProps) {
  const { data, isLoading, isError } = useRows(sheetId, MAX_ROWS, 0);

  // Kolom posisional (A, B, C…) diurutkan; orderIndex 1-based selaras koordinat merge.
  const orderedCols = useMemo(
    () => [...columns].sort((a, b) => a.orderIndex - b.orderIndex),
    [columns],
  );
  const mergeIndex = useMemo(() => buildMergeIndex(merges), [merges]);

  const rows: SheetRow[] = data?.rows ?? [];
  const total = data?.total ?? 0;

  if (isError) {
    return (
      <p className="py-8 text-center text-sm text-[var(--destructive)]">
        Gagal memuat baris. Periksa koneksi dan muat ulang.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-[var(--radius-lg-val)] border border-[var(--border)] py-12 text-sm text-[var(--muted-foreground)]">
        <CircleNotch size={16} className="animate-spin" /> Memuat…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg-val)] border border-[var(--border)] py-12 text-center text-sm text-[var(--muted-foreground)]">
        Belum ada data.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="max-h-[72vh] overflow-auto rounded-[var(--radius-lg-val)] border border-[var(--border)]">
        <table className="border-collapse text-sm">
          <tbody>
            {rows.map((row) => {
              const r = row.orderIndex;
              return (
                <tr key={row.rowId}>
                  {orderedCols.map((col) => {
                    const c = col.orderIndex;
                    if (mergeIndex.isCovered(r, c)) return null; // tersembunyi oleh merge dari atas/kiri
                    const span = mergeIndex.anchorAt(r, c);
                    const isMerged = span !== undefined;
                    return (
                      <td
                        key={col.id}
                        rowSpan={span?.rowSpan}
                        colSpan={span?.colSpan}
                        className={cn(
                          'min-w-[72px] max-w-[320px] break-words border border-[var(--border)] px-3 py-2 align-top text-[var(--foreground)]',
                          // Sel ter-merge biasanya header grup → tampil terpusat & tebal agar terbaca seperti Excel.
                          isMerged
                            ? 'bg-[var(--muted)] text-center font-semibold text-[var(--muted-foreground)]'
                            : 'text-left',
                        )}
                      >
                        {renderCellValue(row.cells[col.id] ?? null)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <span className="text-xs text-[var(--muted-foreground)]">
        {total > rows.length
          ? `Menampilkan ${rows.length} dari ${total} baris (batas ${MAX_ROWS}).`
          : `${total} baris`}
      </span>
    </div>
  );
}
