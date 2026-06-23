import { useParams } from 'react-router-dom';

export default function SheetPage() {
  const { sheetId } = useParams<{ sheetId: string }>();

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-[var(--foreground)]">Tabel Sheet</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Tabel untuk sheet{' '}
        <code className="rounded bg-[var(--muted)] px-1 py-0.5 font-mono text-xs text-[var(--foreground)]">
          {sheetId}
        </code>{' '}
        akan ditampilkan di sini pada FE-008.
      </p>
    </div>
  );
}
