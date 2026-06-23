import { useQuery } from '@tanstack/react-query';
import { getSheet } from '@/features/sheets/api/sheets.api';
import { queryKeys } from '@/lib/query-keys';

export function useSheet(id: string) {
  return useQuery({
    queryKey: queryKeys.sheets.meta(id),
    queryFn: () => getSheet(id),
    enabled: !!id,
  });
}
