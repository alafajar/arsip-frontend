import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { renameMenu } from '@/features/menus/api/menus.api';
import { queryKeys } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api/error-message';

export function useRenameMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      name,
      parentId,
    }: {
      id: string;
      name: string;
      parentId: string | null;
    }) => renameMenu(id, { name, parentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menus.all() });
      toast.success('Nama map berhasil diubah.');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
