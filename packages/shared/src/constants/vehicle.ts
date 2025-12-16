export const VehicleType = {
  PASSENGER: 'PASSENGER',
  CARGO: 'CARGO',
} as const;

export type VehicleType = (typeof VehicleType)[keyof typeof VehicleType];

export const VehicleTypeLabels: Record<VehicleType, string> = {
  PASSENGER: 'Passenger Vehicle',
  CARGO: 'Cargo Vehicle',
};

export const VehicleOwnership = {
  COMPANY: 'COMPANY',
  RENTAL: 'RENTAL',
} as const;

export type VehicleOwnership = (typeof VehicleOwnership)[keyof typeof VehicleOwnership];

export const VehicleOwnershipLabels: Record<VehicleOwnership, string> = {
  COMPANY: 'Company Owned',
  RENTAL: 'Rental',
};

export const VehicleStatus = {
  AVAILABLE: 'AVAILABLE',
  IN_USE: 'IN_USE',
  MAINTENANCE: 'MAINTENANCE',
} as const;

export type VehicleStatus = (typeof VehicleStatus)[keyof typeof VehicleStatus];

export const VehicleStatusLabels: Record<VehicleStatus, string> = {
  AVAILABLE: 'Available',
  IN_USE: 'In Use',
  MAINTENANCE: 'Under Maintenance',
};

export const DriverStatus = {
  AVAILABLE: 'AVAILABLE',
  ON_DUTY: 'ON_DUTY',
  OFF: 'OFF',
} as const;

export type DriverStatus = (typeof DriverStatus)[keyof typeof DriverStatus];

export const DriverStatusLabels: Record<DriverStatus, string> = {
  AVAILABLE: 'Available',
  ON_DUTY: 'On Duty',
  OFF: 'Off Duty',
};

export const RegionType = {
  HEADQUARTERS: 'HEADQUARTERS',
  BRANCH: 'BRANCH',
  MINE: 'MINE',
} as const;

export type RegionType = (typeof RegionType)[keyof typeof RegionType];

export const RegionTypeLabels: Record<RegionType, string> = {
  HEADQUARTERS: 'Headquarters',
  BRANCH: 'Branch Office',
  MINE: 'Mining Site',
};

export const ServiceType = {
  ROUTINE: 'ROUTINE',
  REPAIR: 'REPAIR',
} as const;

export type ServiceType = (typeof ServiceType)[keyof typeof ServiceType];

export const ServiceStatus = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;

export type ServiceStatus = (typeof ServiceStatus)[keyof typeof ServiceStatus];
