import { useQuery } from '@tanstack/react-query';
import { getTree } from '@/features/menus/api/menus.api';
import { queryKeys } from '@/lib/query-keys';

export function useMenuTree() {
  return useQuery({
    queryKey: queryKeys.menus.all(),
    queryFn: getTree,
  });
}
