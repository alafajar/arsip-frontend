import { CircleNotch } from '@phosphor-icons/react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteMapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mapName: string;
  isPending: boolean;
  onConfirm: () => void;
}

export function DeleteMapDialog({
  open, onOpenChange, mapName, isPending, onConfirm,
}: DeleteMapDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Map "{mapName}"?</DialogTitle>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Menghapus map ini juga menghapus semua sub-map dan berkas di dalamnya.
            Tindakan ini tidak dapat dibatalkan. Lanjutkan?
          </p>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending
              ? <><CircleNotch size={14} className="animate-spin" /> Menghapus…</>
              : 'Hapus'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
