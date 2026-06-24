import { FolderSimple, PencilSimple, Trash } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface MapCardProps {
  name: string;
  viewMode: 'grid' | 'list';
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

export function MapCard({ name, viewMode, onClick, canEdit, onRename, onDelete }: MapCardProps) {
  if (viewMode === 'list') {
    return (
      <div className="group relative flex items-center hover:bg-[var(--muted)]">
        <button
          type="button"
          onClick={onClick}
          className="flex flex-1 cursor-pointer items-center gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)]"
        >
          <FolderSimple size={18} weight="fill" className="shrink-0 text-[var(--primary)]" />
          <span className="text-sm text-[var(--foreground)]">{name}</span>
        </button>
        {canEdit && onRename && onDelete && (
          <div className="flex items-center gap-0.5 pr-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            {actionBtn('Ubah nama', onRename)}
            {actionBtn('Hapus', onDelete, true)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex w-full cursor-pointer flex-col items-center gap-2 rounded-[var(--radius-lg-val)]',
          'border border-[var(--border)] p-4 transition-colors',
          'hover:border-[var(--primary)] hover:bg-[var(--muted)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
        )}
      >
        <FolderSimple size={32} weight="fill" className="text-[var(--primary)]" />
        <span className="w-full truncate text-center text-sm font-medium text-[var(--foreground)]">
          {name}
        </span>
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
