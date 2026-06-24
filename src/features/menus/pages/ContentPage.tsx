import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlass, SquaresFour, List, SortAscending, SortDescending, FolderPlus, CloudArrowUp,
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
        <div className="h-4 w-40 rounded bg-border" />
        <div className="h-7 w-56 rounded bg-border" />
        <div className="mt-6 grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-(--radius-lg-val) bg-border" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-destructive">Gagal memuat menu. Periksa koneksi dan muat ulang.</p>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-sm font-medium text-foreground">Map tidak ditemukan.</p>
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
        'rounded-(--radius) p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        viewMode === mode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
      )}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className="flex flex-col gap-6 p-8">
      <Breadcrumb path={ancestorPath} />

      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-foreground">{node.name}</h1>
        {canEdit && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setUploadOpen(true)}>
              <CloudArrowUp size={14} /> Unggah Berkas
            </Button>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <FolderPlus size={14} /> Tambah Map
            </Button>
          </div>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <p className="text-sm font-medium text-foreground">Belum ada isi</p>
          <p className="text-xs text-muted-foreground">Map ini belum memiliki sub-map atau berkas.</p>
          {canEdit && (
            <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
              <FolderPlus size={14} /> Tambah Map
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <div className="relative max-w-xs flex-1">
              <MagnifyingGlass size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Cari di Map..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
            </div>
            <button
              type="button"
              onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
              className="flex items-center gap-1 rounded-(--radius) border border-border px-2.5 py-1.5 text-xs text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {sortDir === 'asc' ? <SortAscending size={14} /> : <SortDescending size={14} />}
              Nama
            </button>
            <div className="flex items-center gap-1">
              {viewBtn('grid', 'Tampilan grid', SquaresFour)}
              {viewBtn('list', 'Tampilan list', List)}
            </div>
          </div>

          {hasChildren && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-foreground">Map</h2>
              {filteredChildren.length === 0 ? (
                <p className="text-xs text-muted-foreground">Tidak ada hasil untuk &ldquo;{search}&rdquo;.</p>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {filteredChildren.map((child) => (
                    <MapCard key={child.id} name={child.name} viewMode="grid"
                      onClick={() => navigate(`/konten/${child.id}`)}
                      canEdit={canEdit}
                      onRename={() => setRenameTarget({ node: child })}
                      onDelete={() => setDeleteTarget({ node: child })}
                    />
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-border rounded-(--radius-lg-val) border border-border">
                  {filteredChildren.map((child) => (
                    <MapCard key={child.id} name={child.name} viewMode="list"
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
              <h2 className="mb-3 text-sm font-semibold text-foreground">Berkas</h2>
              {filteredSheets.length === 0 ? (
                <p className="text-xs text-muted-foreground">Tidak ada hasil untuk &ldquo;{search}&rdquo;.</p>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {filteredSheets.map((sheet) => (
                    <BerkasCard key={sheet.id} name={sheet.name} viewMode="grid"
                      onClick={() => navigate(`/sheets/${sheet.id}`)}
                      canEdit={canEdit}
                      onRename={() => handleBerkasAction('rename')}
                      onDelete={() => handleBerkasAction('delete')}
                    />
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-border rounded-(--radius-lg-val) border border-border">
                  {filteredSheets.map((sheet) => (
                    <BerkasCard key={sheet.id} name={sheet.name} viewMode="list"
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
