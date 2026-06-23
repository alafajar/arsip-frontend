import type { KeyboardEvent } from 'react';
import { FileText } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface BerkasCardProps {
  name: string;
  viewMode: 'grid' | 'list';
  onClick: () => void;
}

function handleKey(onClick: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }
  };
}

export function BerkasCard({ name, viewMode, onClick }: BerkasCardProps) {
  if (viewMode === 'list') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={handleKey(onClick)}
        className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)]"
      >
        <FileText size={18} weight="duotone" className="shrink-0 text-[var(--muted-foreground)]" />
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
        'hover:border-[var(--ring)] hover:bg-[var(--muted)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
      )}
    >
      <FileText size={32} weight="duotone" className="text-[var(--muted-foreground)]" />
      <span className="w-full truncate text-center text-sm font-medium text-[var(--foreground)]">
        {name}
      </span>
    </div>
  );
}
