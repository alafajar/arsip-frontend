import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUp, CircleNotch, FileXls, X } from '@phosphor-icons/react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useImportWorkbook } from '@/features/imports/hooks/useImportWorkbook';
import { cn } from '@/lib/utils';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPT = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
};

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentMenuId: string;
}

export function UploadDialog({ open, onOpenChange, parentMenuId }: UploadDialogProps) {
  const { mutate, isPending } = useImportWorkbook();

  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [rejectionMsg, setRejectionMsg] = useState<string | null>(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setFile(null);
      setName('');
      setRejectionMsg(null);
    }
  }, [open]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPT,
    maxSize: MAX_SIZE,
    maxFiles: 1,
    disabled: isPending,
    onDropAccepted: ([accepted]) => {
      setFile(accepted);
      setName(accepted.name.replace(/\.xlsx$/i, ''));
      setRejectionMsg(null);
    },
    onDropRejected: (rejections) => {
      const code = rejections[0]?.errors[0]?.code;
      if (code === 'file-too-large') setRejectionMsg('File terlalu besar. Maksimum 10 MB.');
      else if (code === 'file-invalid-type') setRejectionMsg('Hanya file .xlsx yang diizinkan.');
      else setRejectionMsg('File ditolak. Periksa tipe dan ukuran file.');
      setFile(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    mutate({ file, name: name.trim() || undefined, parentMenuId });
  };

  const handleOpenChange = (next: boolean) => {
    if (isPending) return; // block close during upload
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Unggah Berkas Excel</DialogTitle>
        </DialogHeader>

        {isPending && (
          <div className="flex items-center gap-2 rounded-[var(--radius)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            <CircleNotch size={14} className="animate-spin" />
            Mengunggah &amp; memproses… mohon tunggu.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dropzone */}
          {!file ? (
            <div
              {...getRootProps()}
              className={cn(
                'cursor-pointer rounded-[var(--radius)] border-2 border-dashed p-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                isDragActive
                  ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                  : 'border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)]',
                isPending && 'pointer-events-none opacity-50',
              )}
            >
              <input {...getInputProps()} />
              <CloudArrowUp
                size={32}
                className={cn('mx-auto mb-3', isDragActive ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]')}
              />
              <p className="text-sm font-medium text-[var(--foreground)]">
                {isDragActive ? 'Lepaskan file di sini…' : 'Drop file atau klik untuk memilih'}
              </p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">Hanya .xlsx, maks 10 MB</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-[var(--radius)] border border-[var(--border)] px-3 py-2.5">
              <FileXls size={20} className="shrink-0 text-[var(--primary)]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--foreground)]">{file.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{formatSize(file.size)}</p>
              </div>
              {!isPending && (
                <button
                  type="button"
                  aria-label="Hapus file"
                  onClick={() => { setFile(null); setName(''); }}
                  className="shrink-0 rounded p-0.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {rejectionMsg && (
            <p className="text-xs text-[var(--destructive)]">{rejectionMsg}</p>
          )}

          {/* Optional name */}
          {file && (
            <div className="space-y-1.5">
              <Label htmlFor="import-name">Nama (opsional)</Label>
              <Input
                id="import-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama tampilan workbook"
                disabled={isPending}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={!file || isPending}>
              {isPending
                ? <><CircleNotch size={14} className="animate-spin" /> Mengunggah &amp; memproses…</>
                : 'Unggah'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
