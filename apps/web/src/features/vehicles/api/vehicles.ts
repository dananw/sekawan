import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface Vehicle {
  id: number;
  plateNumber: string;
  brand: string;
  model: string;
  type: 'PASSENGER' | 'CARGO';
  ownership: 'COMPANY' | 'RENTAL';
  rentalCompany: string | null;
  regionId: number;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
  createdAt: string;
  updatedAt: string;
  regionName?: string;
  regionType?: string;
}

export interface CreateVehicleInput {
  plateNumber: string;
  brand: string;
  model: string;
  type: 'PASSENGER' | 'CARGO';
  ownership: 'COMPANY' | 'RENTAL';
  rentalCompany?: string;
  regionId: number;
}

export interface UpdateVehicleInput extends Partial<CreateVehicleInput> {
  status?: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
}

export const useVehicles = () => {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const response = await apiClient.get<Vehicle[]>('/vehicles');
      return response.data;
    },
  });
};

export const useVehicle = (id: number) => {
  return useQuery({
    queryKey: ['vehicles', id],
    queryFn: async () => {
      const response = await apiClient.get<Vehicle>(`/vehicles/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useAvailableVehicles = () => {
  return useQuery({
    queryKey: ['vehicles', 'available'],
    queryFn: async () => {
      const response = await apiClient.get<Vehicle[]>('/vehicles/available');
      return response.data;
    },
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateVehicleInput) => {
      const response = await apiClient.post('/vehicles', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateVehicleInput }) => {
      const response = await apiClient.put(`/vehicles/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/vehicles/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};
