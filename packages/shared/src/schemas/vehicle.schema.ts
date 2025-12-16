import { z } from 'zod';
import { VehicleType, VehicleOwnership, VehicleStatus } from '../constants/vehicle';

export const createVehicleSchema = z.object({
  plateNumber: z.string().min(1, 'Plate number is required'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  type: z.enum([VehicleType.PASSENGER, VehicleType.CARGO]),
  ownership: z.enum([VehicleOwnership.COMPANY, VehicleOwnership.RENTAL]),
  rentalCompany: z.string().optional(),
  regionId: z.number().int().positive('Region is required'),
});

export const updateVehicleSchema = createVehicleSchema.partial().extend({
  status: z.enum([VehicleStatus.AVAILABLE, VehicleStatus.IN_USE, VehicleStatus.MAINTENANCE]).optional(),
});

export const vehicleSchema = z.object({
  id: z.number().int().positive(),
  plateNumber: z.string(),
  brand: z.string(),
  model: z.string(),
  type: z.enum([VehicleType.PASSENGER, VehicleType.CARGO]),
  ownership: z.enum([VehicleOwnership.COMPANY, VehicleOwnership.RENTAL]),
  rentalCompany: z.string().nullable(),
  regionId: z.number().int().positive(),
  status: z.enum([VehicleStatus.AVAILABLE, VehicleStatus.IN_USE, VehicleStatus.MAINTENANCE]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type Vehicle = z.infer<typeof vehicleSchema>;
