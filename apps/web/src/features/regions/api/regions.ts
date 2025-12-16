import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface Region {
  id: number;
  name: string;
  type: 'HQ' | 'BRANCH' | 'MINE';
}

export const useRegions = () => {
  return useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const response = await apiClient.get<Region[]>('/regions');
      return response.data;
    },
  });
};
