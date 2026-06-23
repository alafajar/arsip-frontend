import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CaretRight } from '@phosphor-icons/react';
import { useSheet } from '@/features/sheets/hooks/useSheet';
import { useColumns } from '@/features/sheets/hooks/useColumns';
import { useMenuTree } from '@/features/menus/hooks/useMenuTree';
import { getAncestorPath } from '@/features/menus/lib/find-node';
import { SheetTable } from '@/features/sheets/components/SheetTable';
import { Button } from '@/components/ui/button';

const LINK_CLASS =
  'rounded transition-colors hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]';

export default function SheetPage() {
  const { sheetId } = useParams<{ sheetId: string }>();

  const { data: sheet, isLoading: sheetLoading, isError: sheetError } = useSheet(sheetId!);
  const { data: columns, isLoading: colLoading, isError: colError } = useColumns(sheetId!);
  const { data: tree } = useMenuTree();

  // Ancestor menu nodes for breadcrumb — uses cached menu tree, no extra request
  const ancestorPath = useMemo(
    () => (tree && sheet ? getAncestorPath(tree, sheet.menuItem.id) : []),
    [tree, sheet],
  );

  if (sheetLoading) {
    return (
      <div className="animate-pulse space-y-4 p-8">
        <div className="h-4 w-48 rounded bg-[var(--border)]" />
        <div className="h-7 w-64 rounded bg-[var(--border)]" />
        <div className="mt-6 h-48 rounded-[var(--radius-lg-val)] bg-[var(--border)]" />
      </div>
    );
  }

  if (sheetError || !sheet) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-[var(--destructive)]">Gagal memuat sheet. Periksa koneksi dan muat ulang.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-[var(--muted-foreground)]">
          <li>
            <Link to="/" className={LINK_CLASS}>Konten</Link>
          </li>
          {ancestorPath.map((node) => (
            <li key={node.id} className="flex items-center gap-1">
              <CaretRight size={12} aria-hidden="true" />
              <Link to={`/konten/${node.id}`} className={LINK_CLASS}>{node.name}</Link>
            </li>
          ))}
          <li className="flex items-center gap-1">
            <CaretRight size={12} aria-hidden="true" />
            <span aria-current="page" className="font-medium text-[var(--foreground)]">
              {sheet.name}
            </span>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-[var(--foreground)]">{sheet.name}</h1>
        {/* Placeholder — edit actions wired in FE-009 */}
        <Button variant="outline" size="sm" disabled>
          Ubah Detail
        </Button>
      </div>

      {/* Table */}
      {colLoading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-10 rounded-t-[var(--radius-lg-val)] bg-[var(--muted)]" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 rounded bg-[var(--border)]" />
          ))}
        </div>
      ) : colError ? (
        <p className="py-8 text-center text-sm text-[var(--destructive)]">
          Gagal memuat kolom.
        </p>
      ) : (
        <SheetTable sheetId={sheetId!} columns={columns ?? []} />
      )}
    </div>
  );
}
