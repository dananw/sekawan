import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface FuelLog {
  id: number;
  vehicleId: number;
  vehiclePlate?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  liters: number;
  cost: number;
  odometer: number;
  loggedAt: string;
  createdAt: string;
}

export interface CreateFuelLogInput {
  vehicleId: number;
  date: string;
  liters: number;
  cost: number;
  odometerReading: number;
}

export interface UpdateFuelLogInput {
  date?: string;
  liters?: number;
  cost?: number;
  odometerReading?: number;
}

export const useFuelLogs = () => {
  return useQuery({
    queryKey: ['fuel-logs'],
    queryFn: async () => {
      const response = await apiClient.get<FuelLog[]>('/fuel-logs');
      return response.data;
    },
  });
};

export const useFuelLogsByVehicle = (vehicleId: number) => {
  return useQuery({
    queryKey: ['fuel-logs', 'vehicle', vehicleId],
    queryFn: async () => {
      const response = await apiClient.get<FuelLog[]>(`/fuel-logs/vehicle/${vehicleId}`);
      return response.data;
    },
    enabled: !!vehicleId,
  });
};

export const useCreateFuelLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateFuelLogInput) => {
      const response = await apiClient.post('/fuel-logs', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-logs'] });
    },
  });
};

export const useUpdateFuelLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateFuelLogInput }) => {
      const response = await apiClient.put(`/fuel-logs/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-logs'] });
    },
  });
};

export const useDeleteFuelLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/fuel-logs/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-logs'] });
    },
  });
};
