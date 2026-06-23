import { useQuery } from '@tanstack/react-query';
import { getColumns } from '@/features/sheets/api/sheets.api';
import { queryKeys } from '@/lib/query-keys';

export function useColumns(id: string) {
  return useQuery({
    queryKey: queryKeys.sheets.columns(id),
    queryFn: () => getColumns(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
