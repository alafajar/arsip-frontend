import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteRow } from '@/features/sheets/api/sheets.api';
import { queryKeys } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api/error-message';

export function useDeleteRow(sheetId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rowId: string) => deleteRow(sheetId, rowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sheets.rows(sheetId) });
      toast.success('Baris berhasil dihapus.');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
