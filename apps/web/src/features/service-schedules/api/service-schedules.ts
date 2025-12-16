import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface ServiceSchedule {
  id: number;
  vehicleId: number;
  vehiclePlate?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  type: 'ROUTINE' | 'REPAIR';
  description: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  cost?: number;
  odometerReading?: number;
  createdAt: string;
}

export interface CreateServiceScheduleInput {
  vehicleId: number;
  serviceType: string;
  scheduledDate: string;
  description?: string;
  cost?: number;
  odometerReading?: number;
}

export interface UpdateServiceScheduleInput {
  serviceType?: string;
  scheduledDate?: string;
  completedDate?: string;
  status?: string;
  description?: string;
  cost?: number;
  odometerReading?: number;
}

export const useServiceSchedules = () => {
  return useQuery({
    queryKey: ['service-schedules'],
    queryFn: async () => {
      const response = await apiClient.get<ServiceSchedule[]>('/service-schedules');
      return response.data;
    },
  });
};

export const useUpcomingServiceSchedules = () => {
  return useQuery({
    queryKey: ['service-schedules', 'upcoming'],
    queryFn: async () => {
      const response = await apiClient.get<ServiceSchedule[]>('/service-schedules/upcoming');
      return response.data;
    },
  });
};

export const useServiceSchedulesByVehicle = (vehicleId: number) => {
  return useQuery({
    queryKey: ['service-schedules', 'vehicle', vehicleId],
    queryFn: async () => {
      const response = await apiClient.get<ServiceSchedule[]>(`/service-schedules/vehicle/${vehicleId}`);
      return response.data;
    },
    enabled: !!vehicleId,
  });
};

export const useCreateServiceSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateServiceScheduleInput) => {
      const response = await apiClient.post('/service-schedules', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-schedules'] });
    },
  });
};

export const useUpdateServiceSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateServiceScheduleInput }) => {
      const response = await apiClient.put(`/service-schedules/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-schedules'] });
    },
  });
};

export const useCompleteServiceSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.post(`/service-schedules/${id}/complete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-schedules'] });
    },
  });
};

export const useDeleteServiceSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/service-schedules/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-schedules'] });
    },
  });
};

export const useUpdateServiceStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' }) => {
      const response = await apiClient.patch(`/service-schedules/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-schedules'] });
    },
  });
};
