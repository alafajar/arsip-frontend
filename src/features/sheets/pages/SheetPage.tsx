import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CaretRight, MagnifyingGlass, Percent, PencilSimple } from '@phosphor-icons/react';
import { useSheet } from '@/features/sheets/hooks/useSheet';
import { useColumns } from '@/features/sheets/hooks/useColumns';
import { useMenuTree } from '@/features/menus/hooks/useMenuTree';
import { useCanEdit } from '@/features/auth/hooks/useCanEdit';
import { getAncestorPath } from '@/features/menus/lib/find-node';
import { SheetTable } from '@/features/sheets/components/SheetTable';
import { RowFormDialog } from '@/features/sheets/components/RowFormDialog';
import { DeleteRowDialog } from '@/features/sheets/components/DeleteRowDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { SheetRow } from '@/types/api';

const LINK_CLASS =
  'rounded transition-colors hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]';

export default function SheetPage() {
  const { sheetId } = useParams<{ sheetId: string }>();

  const { data: sheet, isLoading: sheetLoading, isError: sheetError } = useSheet(sheetId!);
  const { data: columns, isLoading: colLoading, isError: colError } = useColumns(sheetId!);
  const { data: tree } = useMenuTree();
  const canEdit = useCanEdit();

  const [editMode, setEditMode] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null);
  const [editRow, setEditRow] = useState<SheetRow | null>(null);
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const ancestorPath = useMemo(
    () => (tree && sheet ? getAncestorPath(tree, sheet.menuItem.id) : []),
    [tree, sheet],
  );

  const canWrite = canEdit && !!sheet && !sheet.isReadOnly;

  if (sheetLoading) {
    return (
      <div className="animate-pulse space-y-4 p-8">
        <div className="h-4 w-48 rounded bg-[var(--border)]" />
        <div className="h-9 w-64 rounded bg-[var(--border)]" />
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

  const handleEditRow = (row: SheetRow) => { setEditRow(row); setDialogMode('edit'); };
  const handleDeleteRow = (rowId: string) => setDeleteRowId(rowId);
  const handleAddRow = () => { setEditRow(null); setDialogMode('add'); };

  return (
    <div className="flex flex-col">
      {/* Page header */}
      <div className="px-8 pt-6 pb-5">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-[var(--muted-foreground)]">
            <li><Link to="/" className={LINK_CLASS}>Map</Link></li>
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

        <div className="mt-1.5 flex items-end justify-between gap-4">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">{sheet.name}</h1>
          <div className="flex shrink-0 items-center gap-2">
            <div className="relative">
              <MagnifyingGlass
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              />
              <Input
                placeholder="Cari di Berkas"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-52 pl-8 text-sm"
              />
            </div>
            <Button size="sm" variant="outline" type="button">
              <Percent size={14} /> Olah tabel
            </Button>
            {canWrite && (
              <Button
                size="sm"
                onClick={() => setEditMode((m) => !m)}
              >
                <PencilSimple size={14} />
                {editMode ? 'Selesai' : 'Ubah Detail'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <hr className="border-[var(--border)]" />

      {/* Table */}
      <div className="px-8 pt-5 pb-8">
        {colLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-10 rounded-t-[var(--radius-lg-val)] bg-[var(--muted)]" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 rounded bg-[var(--border)]" />
            ))}
          </div>
        ) : colError ? (
          <p className="py-8 text-center text-sm text-[var(--destructive)]">Gagal memuat kolom.</p>
        ) : (
          <SheetTable
            sheetId={sheetId!}
            columns={columns ?? []}
            editMode={editMode}
            onEditRow={handleEditRow}
            onDeleteRow={handleDeleteRow}
            onAddRow={handleAddRow}
          />
        )}
      </div>

      {columns && (
        <RowFormDialog
          open={dialogMode !== null}
          onOpenChange={(open) => { if (!open) setDialogMode(null); }}
          mode={dialogMode ?? 'add'}
          sheetId={sheetId!}
          columns={columns}
          row={editRow ?? undefined}
        />
      )}
      <DeleteRowDialog
        open={deleteRowId !== null}
        onOpenChange={(open) => { if (!open) setDeleteRowId(null); }}
        sheetId={sheetId!}
        rowId={deleteRowId}
      />
    </div>
  );
}
