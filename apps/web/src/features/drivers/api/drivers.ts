import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface Driver {
  id: number;
  name: string;
  licenseNumber: string;
  phone: string;
  regionId: number;
  status: 'AVAILABLE' | 'ON_DUTY' | 'OFF';
  createdAt: string;
  updatedAt: string;
  regionName?: string;
  regionType?: string;
}

export interface CreateDriverInput {
  name: string;
  licenseNumber: string;
  phone: string;
  regionId: number;
}

export interface UpdateDriverInput extends Partial<CreateDriverInput> {
  status?: 'AVAILABLE' | 'ON_DUTY' | 'OFF';
}

export const useDrivers = () => {
  return useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const response = await apiClient.get<Driver[]>('/drivers');
      return response.data;
    },
  });
};

export const useDriver = (id: number) => {
  return useQuery({
    queryKey: ['drivers', id],
    queryFn: async () => {
      const response = await apiClient.get<Driver>(`/drivers/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useAvailableDrivers = () => {
  return useQuery({
    queryKey: ['drivers', 'available'],
    queryFn: async () => {
      const response = await apiClient.get<Driver[]>('/drivers/available');
      return response.data;
    },
  });
};

export const useCreateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateDriverInput) => {
      const response = await apiClient.post('/drivers', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
};

export const useUpdateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateDriverInput }) => {
      const response = await apiClient.put(`/drivers/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
};

export const useDeleteDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/drivers/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
};
