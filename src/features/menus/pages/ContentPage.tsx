import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlass, SquaresFour, List, SortAscending, SortDescending,
  FolderPlus, CloudArrowUp, FolderOpen, FolderSimple, FileText, File,
} from '@phosphor-icons/react';
import { useMenuTree } from '@/features/menus/hooks/useMenuTree';
import { findNodeById, getAncestorPath } from '@/features/menus/lib/find-node';
import { Breadcrumb } from '@/features/menus/components/Breadcrumb';
import { MapCard } from '@/features/menus/components/MapCard';
import { BerkasCard } from '@/features/menus/components/BerkasCard';
import { CreateMapDialog } from '@/features/menus/components/CreateMapDialog';
import { RenameMapDialog } from '@/features/menus/components/RenameMapDialog';
import { DeleteMapDialog } from '@/features/menus/components/DeleteMapDialog';
import { UploadDialog } from '@/features/imports/components/UploadDialog';
import { useCanEdit } from '@/features/auth/hooks/useCanEdit';
import { useMapActions } from '@/features/menus/hooks/useMapActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';
type SortDir = 'asc' | 'desc';

function byName<T extends { name: string }>(dir: SortDir) {
  return (a: T, b: T) =>
    dir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
}

export default function ContentPage() {
  const { menuId } = useParams<{ menuId: string }>();
  const navigate = useNavigate();
  const { data: tree, isLoading, isError } = useMenuTree();
  const canEdit = useCanEdit();

  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const {
    renameTarget, setRenameTarget,
    deleteTarget, setDeleteTarget,
    renameMutation, deleteMutation,
    handleRenameConfirm, handleDeleteConfirm, handleBerkasAction,
  } = useMapActions(menuId);

  const node = useMemo(
    () => (menuId && tree ? findNodeById(tree, menuId) : undefined),
    [tree, menuId],
  );

  const ancestorPath = useMemo(
    () => (menuId && tree ? getAncestorPath(tree, menuId) : []),
    [tree, menuId],
  );

  const q = search.toLowerCase();
  const filteredChildren = useMemo(
    () => (node?.children ?? []).filter((c) => c.name.toLowerCase().includes(q)).sort(byName(sortDir)),
    [node, q, sortDir],
  );
  const filteredSheets = useMemo(
    () => (node?.sheets ?? []).filter((s) => s.name.toLowerCase().includes(q)).sort(byName(sortDir)),
    [node, q, sortDir],
  );

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 p-8">
        <div className="h-4 w-40 rounded bg-[var(--border)]" />
        <div className="h-8 w-56 rounded bg-[var(--border)]" />
        <div className="mt-6 grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-[var(--radius-lg-val)] bg-[var(--border)]" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-[var(--destructive)]">Gagal memuat menu. Periksa koneksi dan muat ulang.</p>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-sm font-medium text-[var(--foreground)]">Map tidak ditemukan.</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/')}>Kembali ke beranda</Button>
      </div>
    );
  }

  const hasChildren = node.children.length > 0;
  const hasSheets = node.sheets.length > 0;
  const isEmpty = !hasChildren && !hasSheets;

  const viewBtn = (mode: ViewMode, label: string, Icon: React.ElementType) => (
    <button
      type="button"
      onClick={() => setViewMode(mode)}
      aria-label={label}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
        viewMode === mode
          ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
          : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]',
      )}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className="flex min-h-full flex-col">
      {/* Page header */}
      <div className="px-8 pt-6 pb-5">
        <Breadcrumb path={ancestorPath} />
        <div className="mt-1.5 flex items-end justify-between gap-4">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">{node.name}</h1>
          <div className="flex shrink-0 items-center gap-2">
            <div className="relative">
              <MagnifyingGlass
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              />
              <Input
                placeholder="Cari di Map"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-52 pl-8 text-sm"
              />
            </div>
            {canEdit && (
              <>
                <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
                  <FolderPlus size={14} /> Tambah Map
                </Button>
                <Button size="sm" variant="outline" type="button">
                  <File size={14} /> Buat Berkas
                </Button>
                <Button size="sm" onClick={() => setUploadOpen(true)}>
                  <CloudArrowUp size={14} /> Unggah Berkas
                </Button>
              </>
            )}
            <div className="ml-1 flex items-center gap-1">
              {viewBtn('list', 'Tampilan list', List)}
              {viewBtn('grid', 'Tampilan grid', SquaresFour)}
            </div>
          </div>
        </div>
      </div>

      <hr className="border-[var(--border)]" />

      {/* Content area */}
      <div className="flex flex-1 flex-col px-8 pt-4 pb-8">
        {isEmpty ? (
          /* ── EMPTY STATE: sort chip + dashed drop-zone fills remaining height ── */
          <div className="flex flex-1 flex-col rounded-[var(--radius-lg-val)] border-2 border-dashed border-[var(--border)] p-4">
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                className="flex items-center gap-1 rounded border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                Nama
                {sortDir === 'asc' ? <SortAscending size={13} /> : <SortDescending size={13} />}
              </button>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--muted)]">
                <FolderOpen size={28} className="text-[var(--muted-foreground)]" />
              </div>
              <p className="text-base font-semibold text-[var(--foreground)]">Belum ada isi</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Unggah atau buat dokumen baru untuk mulai mengisi ruang ini.
              </p>
              {canEdit && (
                <div className="mt-1 flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
                    <FolderPlus size={14} /> Tambah Map
                  </Button>
                  <Button size="sm" onClick={() => setUploadOpen(true)}>
                    <CloudArrowUp size={14} /> Unggah Berkas
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── HAS CONTENT: sort chip + content, no dashed border ── */
          <>
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                className="flex items-center gap-1 rounded border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                Nama
                {sortDir === 'asc' ? <SortAscending size={13} /> : <SortDescending size={13} />}
              </button>
            </div>

            {viewMode === 'list' ? (
              /* ── LIST VIEW ──────────────────────────────────────────── */
              <div className="overflow-hidden rounded-[var(--radius-lg-val)] border border-[var(--border)]">
                <div className="flex items-center border-b border-[var(--border)] px-4 py-2.5 text-xs font-medium text-[var(--muted-foreground)]">
                  <span className="flex-1">Nama</span>
                  <span className="w-44 shrink-0">Tanggal Diunggah</span>
                  <span className="w-24 shrink-0">Ukuran</span>
                  <span className="w-16 shrink-0" />
                </div>

                {filteredChildren.map((child) => (
                  <MapCard
                    key={child.id}
                    name={child.name}
                    viewMode="list"
                    onClick={() => navigate(`/konten/${child.id}`)}
                    canEdit={canEdit}
                    onRename={() => setRenameTarget({ node: child })}
                    onDelete={() => setDeleteTarget({ node: child })}
                  />
                ))}

                {filteredSheets.map((sheet) => (
                  <BerkasCard
                    key={sheet.id}
                    name={sheet.name}
                    viewMode="list"
                    onClick={() => navigate(`/sheets/${sheet.id}`)}
                    canEdit={canEdit}
                    onRename={() => handleBerkasAction('rename')}
                    onDelete={() => handleBerkasAction('delete')}
                  />
                ))}

                {filteredChildren.length === 0 && filteredSheets.length === 0 && (
                  <p className="px-4 py-8 text-sm text-[var(--muted-foreground)]">
                    Tidak ada hasil untuk &ldquo;{search}&rdquo;.
                  </p>
                )}
              </div>
            ) : (
              /* ── GRID VIEW ──────────────────────────────────────────── */
              <>
                {hasChildren && (
                  <section className="mb-6">
                    <div className="mb-3 flex items-center gap-2">
                      <FolderSimple size={13} className="text-[var(--muted-foreground)]" />
                      <span className="text-xs text-[var(--muted-foreground)]">Map</span>
                      <hr className="flex-1 border-[var(--border)]" />
                    </div>
                    {filteredChildren.length === 0 ? (
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Tidak ada hasil untuk &ldquo;{search}&rdquo;.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {filteredChildren.map((child) => (
                          <MapCard
                            key={child.id}
                            name={child.name}
                            viewMode="grid"
                            onClick={() => navigate(`/konten/${child.id}`)}
                            canEdit={canEdit}
                            onRename={() => setRenameTarget({ node: child })}
                            onDelete={() => setDeleteTarget({ node: child })}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {hasSheets && (
                  <section>
                    <div className="mb-3 flex items-center gap-2">
                      <FileText size={13} className="text-[var(--muted-foreground)]" />
                      <span className="text-xs text-[var(--muted-foreground)]">Berkas</span>
                      <hr className="flex-1 border-[var(--border)]" />
                    </div>
                    {filteredSheets.length === 0 ? (
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Tidak ada hasil untuk &ldquo;{search}&rdquo;.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {filteredSheets.map((sheet) => (
                          <BerkasCard
                            key={sheet.id}
                            name={sheet.name}
                            viewMode="grid"
                            onClick={() => navigate(`/sheets/${sheet.id}`)}
                            canEdit={canEdit}
                            onRename={() => handleBerkasAction('rename')}
                            onDelete={() => handleBerkasAction('delete')}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                )}
              </>
            )}
          </>
        )}
      </div>

      <CreateMapDialog open={dialogOpen} onOpenChange={setDialogOpen} parentId={menuId ?? null} />
      <RenameMapDialog
        open={renameTarget !== null}
        onOpenChange={(open) => { if (!open) setRenameTarget(null); }}
        initialName={renameTarget?.node.name ?? ''}
        isPending={renameMutation.isPending}
        onConfirm={handleRenameConfirm}
      />
      <DeleteMapDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        mapName={deleteTarget?.node.name ?? ''}
        isPending={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} parentMenuId={menuId ?? ''} />
    </div>
  );
}
