import { z } from 'zod';
import { DriverStatus } from '../constants/vehicle';

export const createDriverSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  licenseNumber: z.string().min(1, 'License number is required'),
  phone: z.string().min(1, 'Phone number is required'),
  regionId: z.number().int().positive('Region is required'),
});

export const updateDriverSchema = createDriverSchema.partial().extend({
  status: z.enum([DriverStatus.AVAILABLE, DriverStatus.ON_DUTY, DriverStatus.OFF]).optional(),
});

export const driverSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  licenseNumber: z.string(),
  phone: z.string(),
  regionId: z.number().int().positive(),
  status: z.enum([DriverStatus.AVAILABLE, DriverStatus.ON_DUTY, DriverStatus.OFF]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;
export type Driver = z.infer<typeof driverSchema>;
