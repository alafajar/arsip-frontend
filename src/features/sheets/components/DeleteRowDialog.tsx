import { CircleNotch } from '@phosphor-icons/react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDeleteRow } from '@/features/sheets/hooks/useDeleteRow';

interface DeleteRowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sheetId: string;
  rowId: string | null;
}

export function DeleteRowDialog({ open, onOpenChange, sheetId, rowId }: DeleteRowDialogProps) {
  const { mutate, isPending } = useDeleteRow(sheetId);

  const handleConfirm = () => {
    if (!rowId) return;
    mutate(rowId, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus baris ini?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-[var(--muted-foreground)]">Aksi ini tidak dapat dibatalkan.</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending
              ? <><CircleNotch size={14} className="animate-spin" /> Menghapus…</>
              : 'Hapus'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
