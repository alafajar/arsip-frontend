import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getRows } from '@/features/sheets/api/sheets.api';
import { queryKeys } from '@/lib/query-keys';

export function useRows(id: string, limit: number, offset: number) {
  return useQuery({
    queryKey: queryKeys.sheets.rowsPage(id, limit, offset),
    queryFn: () => getRows(id, limit, offset),
    enabled: !!id,
    placeholderData: keepPreviousData,
  });
}
