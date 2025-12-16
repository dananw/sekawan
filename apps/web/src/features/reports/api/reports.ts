import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface BookingReport {
  id: number;
  vehiclePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleType: string;
  vehicleOwnership: string;
  driverName: string;
  driverPhone: string;
  startDate: string;
  endDate: string;
  purpose: string;
  status: string;
  createdAt: string;
}

export interface ReportSummary {
  total: number;
  byStatus: {
    PENDING_L1: number;
    PENDING_L2: number;
    APPROVED: number;
    REJECTED: number;
    COMPLETED: number;
    CANCELLED: number;
  };
  byVehicleType: {
    PASSENGER: number;
    CARGO: number;
  };
  byOwnership: {
    COMPANY: number;
    RENTAL: number;
  };
}

export const useBookingsReport = (filters: ReportFilters) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.status) params.append('status', filters.status);

  return useQuery({
    queryKey: ['reports', 'bookings', filters],
    queryFn: async () => {
      const response = await apiClient.get<BookingReport[]>(`/reports/bookings?${params}`);
      return response.data;
    },
  });
};

export const useReportSummary = (filters: ReportFilters) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.status) params.append('status', filters.status);

  return useQuery({
    queryKey: ['reports', 'summary', filters],
    queryFn: async () => {
      const response = await apiClient.get<ReportSummary>(`/reports/bookings/summary?${params}`);
      return response.data;
    },
  });
};

export const exportToExcel = async (filters: ReportFilters) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.status) params.append('status', filters.status);

  const response = await apiClient.get(`/reports/bookings/export?${params}`, {
    responseType: 'blob',
  });

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `bookings-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
