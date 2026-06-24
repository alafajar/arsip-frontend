import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CircleNotch } from '@phosphor-icons/react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateRow } from '@/features/sheets/hooks/useCreateRow';
import { useUpdateRow } from '@/features/sheets/hooks/useUpdateRow';
import type { Column as ApiColumn, SheetRow } from '@/types/api';

interface RowFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  sheetId: string;
  columns: ApiColumn[];
  row?: SheetRow;
}

function getLeafColumns(cols: ApiColumn[]): ApiColumn[] {
  return cols.flatMap((c) => (c.children.length > 0 ? getLeafColumns(c.children) : [c]));
}

export function RowFormDialog({ open, onOpenChange, mode, sheetId, columns, row }: RowFormDialogProps) {
  const createMutation = useCreateRow(sheetId);
  const updateMutation = useUpdateRow(sheetId);
  const isPending = createMutation.isPending || updateMutation.isPending;

  // MOCK(sprint2): "Dokumen Internal" toggle per URL column — state only, not sent to backend
  const [internalDoc, setInternalDoc] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(sessionStorage.getItem('wreksa:internal-doc') ?? '{}'); } // MOCK(sprint2)
    catch { return {}; }
  });

  const { register, handleSubmit, reset, watch, setValue } = useForm<Record<string, string>>();

  const sortedColumns = useMemo(
    () => [...columns].sort((a, b) => a.orderIndex - b.orderIndex),
    [columns],
  );

  useEffect(() => {
    if (!open) return;
    const defaults: Record<string, string> = {};
    getLeafColumns(columns).forEach((col) => {
      defaults[col.id] = (mode === 'edit' ? row?.cells[col.id] : undefined) ?? '';
    });
    reset(defaults);
  }, [open, mode, row, columns, reset]);

  const onSubmit = handleSubmit((values) => {
    const leaves = getLeafColumns(columns);
    if (mode === 'add') {
      const cells = leaves
        .filter((col) => (values[col.id] ?? '') !== '')
        .map((col) => ({ columnId: col.id, value: values[col.id] }));
      createMutation.mutate({ cells }, { onSuccess: () => { reset(); onOpenChange(false); } });
    } else {
      if (!row) return;
      // Send all leaves: empty string = delete-on-empty
      const cells = leaves.map((col) => ({ columnId: col.id, value: values[col.id] ?? '' }));
      updateMutation.mutate(
        { rowId: row.rowId, body: { cells } },
        { onSuccess: () => { reset(); onOpenChange(false); } },
      );
    }
  });

  // Recursive renderer: group → fieldset with children side-by-side; leaf → input by type
  const renderEntry = (col: ApiColumn): React.ReactNode => {
    if (col.children.length > 0) {
      const sorted = [...col.children].sort((a, b) => a.orderIndex - b.orderIndex);
      return (
        <fieldset key={col.id} className="rounded-[var(--radius)] border border-[var(--border)] p-3">
          <legend className="px-1 text-xs font-medium text-[var(--muted-foreground)]">
            {col.name}
          </legend>
          <div className={sorted.length > 1 ? 'grid grid-cols-2 gap-3' : ''}>
            {sorted.map(renderEntry)}
          </div>
        </fieldset>
      );
    }

    const inputId = `rfd-${col.id}`;

    if (col.type === 'BOOLEAN') {
      return (
        <div key={col.id} className="flex items-center gap-2 pt-1">
          <Checkbox
            id={inputId}
            checked={watch(col.id) === 'true'}
            onCheckedChange={(c) => setValue(col.id, c ? 'true' : '', { shouldDirty: true })}
          />
          <Label htmlFor={inputId}>{col.name}</Label>
        </div>
      );
    }

    if (col.type === 'URL') {
      return (
        <div key={col.id} className="space-y-1.5">
          <Label htmlFor={inputId}>{col.name}</Label>
          <p className="text-xs text-[var(--muted-foreground)]">Tautan Eksternal</p>
          <Input id={inputId} type="url" placeholder="https://…" {...register(col.id)} />
          {/* ↓ MOCK(sprint2): toggle + picker — state ke sessionStorage, tidak masuk DB */}
          <div className="flex items-center gap-2 rounded-[var(--radius)] border border-dashed border-[var(--border)] px-3 py-2">
            <Checkbox
              id={`internal-${col.id}`}
              checked={internalDoc[col.id] ?? false}
              onCheckedChange={(c) => {
                const next = { ...internalDoc, [col.id]: !!c };
                setInternalDoc(next);
                try { sessionStorage.setItem('wreksa:internal-doc', JSON.stringify(next)); } catch {} // MOCK(sprint2)
              }}
            />
            <label htmlFor={`internal-${col.id}`} className="flex-1 text-xs text-[var(--muted-foreground)]">
              Dokumen Internal
            </label>
            <span className="text-xs text-[var(--muted-foreground)] opacity-50">
              Pilih berkas dari arsip
            </span>
          </div>
        </div>
      );
    }

    const inputType = col.type === 'DATE' ? 'date' : 'text';
    const inputMode: React.HTMLAttributes<HTMLInputElement>['inputMode'] =
      col.type === 'INTEGER' ? 'numeric' : col.type === 'FLOAT' ? 'decimal' : 'text';

    return (
      <div key={col.id} className="space-y-1.5">
        <Label htmlFor={inputId}>{col.name}</Label>
        <Input id={inputId} type={inputType} inputMode={inputMode} {...register(col.id)} />
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Tambah Baris' : 'Ubah Baris'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate>
          <div className="max-h-[60vh] space-y-4 overflow-y-auto py-4 pr-1">
            {sortedColumns.map(renderEntry)}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? <><CircleNotch size={14} className="animate-spin" /> Menyimpan…</>
                : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
