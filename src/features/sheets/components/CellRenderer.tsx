import type { ColumnType } from '@/types/api';

interface CellRendererProps {
  value: string | null;
  type: ColumnType;
}

const EMPTY = <span className="text-[var(--muted-foreground)]">—</span>;

export function CellRenderer({ value, type }: CellRendererProps) {
  if (value === null || value === '') return EMPTY;

  if (type === 'URL') {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded text-[var(--primary)] underline underline-offset-2 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        Buka folder
      </a>
    );
  }

  // All other types (TEXT, INTEGER, FLOAT, DATE, BOOLEAN, MARKING) — display verbatim.
  // Never coerce to number: INTEGER cells are string "0017026012" etc.; parsing would
  // silently drop leading zeros, corrupting NIDN and similar identifiers.
  return <>{value}</>;
}
