import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteMenu } from '@/features/menus/api/menus.api';
import { queryKeys } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api/error-message';

export function useDeleteMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menus.all() });
      toast.success('Map dihapus.');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
