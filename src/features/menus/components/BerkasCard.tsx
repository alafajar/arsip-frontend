import { FileText, PencilSimple, Trash } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface BerkasCardProps {
  name: string;
  viewMode: 'grid' | 'list';
  uploadedAt?: string;
  size?: string;
  onClick: () => void;
  canEdit?: boolean;
  onRename?: () => void;
  onDelete?: () => void;
}

const actionBtn = (label: string, onClick: () => void, danger?: boolean) => (
  <button
    type="button"
    aria-label={label}
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={cn(
      'rounded p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
      danger
        ? 'text-[var(--destructive)] hover:bg-[var(--muted)]'
        : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]',
    )}
  >
    {danger ? <Trash size={12} /> : <PencilSimple size={12} />}
  </button>
);

export function BerkasCard({ name, viewMode, uploadedAt, size, onClick, canEdit, onRename, onDelete }: BerkasCardProps) {
  if (viewMode === 'list') {
    return (
      <div className="group flex items-center border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--muted)]">
        <button
          type="button"
          onClick={onClick}
          className="flex flex-1 cursor-pointer items-center gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)]"
        >
          <FileText size={16} weight="duotone" className="shrink-0 text-[var(--muted-foreground)]" />
          <span className="text-sm font-medium text-[var(--foreground)]">{name}</span>
        </button>
        <span className="w-44 shrink-0 text-sm text-[var(--muted-foreground)]">
          {uploadedAt ? `Diunggah ${uploadedAt}` : '—'}
        </span>
        <span className="w-24 shrink-0 text-sm text-[var(--muted-foreground)]">{size ?? '—'}</span>
        <div className="flex w-16 shrink-0 items-center justify-center">
          {canEdit && onRename && onDelete && (
            <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              {actionBtn('Ubah nama', onRename)}
              {actionBtn('Hapus', onDelete, true)}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-[var(--radius-lg-val)] border border-[var(--border)] bg-[var(--card)]">
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)]"
      >
        <div className="flex h-36 items-center justify-center bg-[var(--muted)]">
          <FileText size={40} weight="thin" className="text-[var(--muted-foreground)]/50" />
        </div>
        <div className="p-3">
          <p className="truncate text-sm font-medium text-[var(--foreground)]">{name}</p>
          {uploadedAt && (
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{uploadedAt}</p>
          )}
        </div>
      </button>
      {canEdit && onRename && onDelete && (
        <div className="absolute right-1 top-1 z-10 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          {actionBtn('Ubah nama', onRename)}
          {actionBtn('Hapus', onDelete, true)}
        </div>
      )}
    </div>
  );
}
