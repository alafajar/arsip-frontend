import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createRow } from '@/features/sheets/api/sheets.api';
import { queryKeys } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api/error-message';
import type { RowWriteBody } from '@/types/api';

export function useCreateRow(sheetId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: RowWriteBody) => createRow(sheetId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sheets.rows(sheetId) });
      toast.success('Baris berhasil ditambahkan.');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
