import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { importWorkbook } from '@/features/imports/api/imports.api';
import { queryKeys } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api/error-message';

export function useImportWorkbook() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: importWorkbook,
    onSuccess: async (data) => {
      // Refetch menu tree BEFORE navigating — prevents "Map tidak ditemukan" flash
      // because the new workbook node won't exist in cache until the tree is refreshed.
      await queryClient.invalidateQueries({ queryKey: queryKeys.menus.all() });
      toast.success(`Import berhasil: ${data.sheets.length} sheet ditambahkan.`);
      navigate(`/konten/${data.workbookMenuId}`);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
