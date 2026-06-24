import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CircleNotch } from '@phosphor-icons/react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  name: z
    .string()
    .min(1, 'Nama wajib diisi')
    .refine((v) => v.trim().length > 0, 'Nama tidak boleh hanya spasi'),
});

type FormValues = z.infer<typeof schema>;

interface RenameMapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName: string;
  isPending: boolean;
  onConfirm: (name: string) => void;
}

export function RenameMapDialog({
  open, onOpenChange, initialName, isPending, onConfirm,
}: RenameMapDialogProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) reset({ name: initialName });
  }, [open, initialName, reset]);

  const onSubmit = handleSubmit(({ name }) => {
    onConfirm(name.trim());
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ubah Nama Map</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="renameName">Nama Map</Label>
            <Input
              id="renameName"
              autoFocus
              disabled={isPending}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-[var(--destructive)]">{errors.name.message}</p>
            )}
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
