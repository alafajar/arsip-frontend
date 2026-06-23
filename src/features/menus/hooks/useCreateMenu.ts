import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createMenu } from '@/features/menus/api/menus.api';
import { queryKeys } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api/error-message';

export function useCreateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menus.all() });
      toast.success('Map berhasil dibuat.');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
