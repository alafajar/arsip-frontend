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
import { useCreateMenu } from '@/features/menus/hooks/useCreateMenu';

const schema = z.object({
  name: z
    .string()
    .min(1, 'Nama wajib diisi')
    .refine((v) => v.trim().length > 0, 'Nama tidak boleh hanya spasi'),
});

type FormValues = z.infer<typeof schema>;

interface CreateMapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId: string | null;
}

export function CreateMapDialog({ open, onOpenChange, parentId }: CreateMapDialogProps) {
  const mutation = useCreateMenu();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Reset form every time dialog opens
  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const onSubmit = handleSubmit(({ name }) => {
    mutation.mutate({ name: name.trim(), parentId }, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Map</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="mapName">Nama Map</Label>
            <Input
              id="mapName"
              placeholder="Masukkan nama map"
              autoFocus
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
              disabled={mutation.isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <><CircleNotch size={14} className="animate-spin" /> Membuat…</>
              ) : (
                'Buat'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
