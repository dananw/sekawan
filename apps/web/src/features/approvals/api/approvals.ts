import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface Approval {
  approvalId: number;
  bookingId: number;
  level: number;
  approvalStatus: string;
  createdAt: string;
  bookingStatus: string;
  purpose: string;
  startDate: string;
  endDate: string;
  vehiclePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  driverName: string;
}

export const usePendingApprovals = () => {
  return useQuery({
    queryKey: ['approvals', 'pending'],
    queryFn: async () => {
      const response = await apiClient.get<Approval[]>('/approvals/pending');
      return response.data;
    },
  });
};

export const useApprovalHistory = () => {
  return useQuery({
    queryKey: ['approvals', 'history'],
    queryFn: async () => {
      const response = await apiClient.get<Approval[]>('/approvals/history');
      return response.data;
    },
  });
};

export const usePendingCount = () => {
  return useQuery({
    queryKey: ['approvals', 'pending', 'count'],
    queryFn: async () => {
      const response = await apiClient.get<{ count: number }>('/approvals/pending/count');
      return response.data;
    },
  });
};
