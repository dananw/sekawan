export interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  activeBookings: number;
  pendingApprovals: number;
  totalDrivers: number;
  availableDrivers: number;
}

export interface VehicleUsageData {
  vehicleId: number;
  plateNumber: string;
  usageCount: number;
  totalHours: number;
}

export interface BookingTrendData {
  date: string;
  count: number;
}

export interface FuelConsumptionData {
  vehicleId: number;
  plateNumber: string;
  totalLiters: number;
  totalCost: number;
}
