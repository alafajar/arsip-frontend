import type { KeyboardEvent } from 'react';
import { FolderSimple } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface MapCardProps {
  name: string;
  viewMode: 'grid' | 'list';
  onClick: () => void;
}

function handleKey(onClick: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }
  };
}

export function MapCard({ name, viewMode, onClick }: MapCardProps) {
  if (viewMode === 'list') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={handleKey(onClick)}
        className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)]"
      >
        <FolderSimple size={18} weight="fill" className="shrink-0 text-[var(--primary)]" />
        <span className="text-sm text-[var(--foreground)]">{name}</span>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKey(onClick)}
      className={cn(
        'flex cursor-pointer flex-col items-center gap-2 rounded-[var(--radius-lg-val)]',
        'border border-[var(--border)] p-4 transition-colors',
        'hover:border-[var(--primary)] hover:bg-[var(--muted)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
      )}
    >
      <FolderSimple size={32} weight="fill" className="text-[var(--primary)]" />
      <span className="w-full truncate text-center text-sm font-medium text-[var(--foreground)]">
        {name}
      </span>
    </div>
  );
}
