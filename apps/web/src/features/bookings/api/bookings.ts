import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface Booking {
  id: number;
  vehicleId: number;
  driverId: number;
  requesterId: number;
  startDate: string;
  endDate: string;
  purpose: string;
  status: 'PENDING_L1' | 'PENDING_L2' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  approverL1Id: number;
  approverL2Id: number;
  createdAt: string;
  vehiclePlate?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  driverName?: string;
}

export interface CreateBookingInput {
  vehicleId: number;
  driverId: number;
  startDate: string;
  endDate: string;
  purpose: string;
  approverL1Id: number;
  approverL2Id: number;
}

export const useBookings = (filters?: { vehicleId?: number; driverId?: number }) => {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.vehicleId) params.append('vehicleId', filters.vehicleId.toString());
      if (filters?.driverId) params.append('driverId', filters.driverId.toString());
      
      const response = await apiClient.get<Booking[]>(`/bookings?${params.toString()}`);
      return response.data;
    },
  });
};

export const useBooking = (id: number) => {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: async () => {
      const response = await apiClient.get(`/bookings/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateBookingInput) => {
      const response = await apiClient.post('/bookings', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useApproveBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, action, notes }: { id: number; action: 'APPROVED' | 'REJECTED'; notes?: string }) => {
      const response = await apiClient.post(`/bookings/${id}/approve`, { action, notes });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateBookingInput> }) => {
      const response = await apiClient.put(`/bookings/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.post(`/bookings/${id}/cancel`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};
