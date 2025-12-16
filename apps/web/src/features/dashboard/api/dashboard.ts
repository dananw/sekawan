import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  totalDrivers: number;
  availableDrivers: number;
  activeBookings: number;
  pendingApprovals: number;
}

export interface RecentBooking {
  id: number;
  purpose: string;
  status: string;
  startDate: string;
  endDate: string;
  vehiclePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  driverName: string;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const response = await apiClient.get<DashboardStats>('/dashboard/stats');
      return response.data;
    },
  });
};

export const useRecentBookings = (limit: number = 5) => {
  return useQuery({
    queryKey: ['dashboard', 'recent-bookings', limit],
    queryFn: async () => {
      const response = await apiClient.get<RecentBooking[]>(`/dashboard/recent-bookings?limit=${limit}`);
      return response.data;
    },
  });
};

export const useBookingTrends = () => {
  return useQuery({
    queryKey: ['dashboard', 'booking-trends'],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/booking-trends');
      return response.data;
    },
  });
};

export const useVehicleUsage = () => {
  return useQuery({
    queryKey: ['dashboard', 'vehicle-usage'],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/vehicle-usage');
      return response.data;
    },
  });
};
