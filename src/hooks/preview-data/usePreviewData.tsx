import api from '@/lib/api';
import type { PreviewDataResponse } from '@/types/preview-data-types';
import { useQuery } from '@tanstack/react-query';

export const usePreviewData = ({ queryId }: { queryId: number }) => {
  return useQuery({
    queryKey: ['preview-data', queryId],
    queryFn: () => api.get<PreviewDataResponse>(`/preview/data/${queryId}`),
    enabled: !!queryId,
  });
};
