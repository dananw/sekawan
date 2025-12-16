import { z } from 'zod';
import { BookingStatus } from '../constants/booking-status';

export const createBookingSchema = z.object({
  vehicleId: z.number().int().positive('Vehicle is required'),
  driverId: z.number().int().positive('Driver is required'),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  purpose: z.string().min(1, 'Purpose is required'),
  approverL1Id: z.number().int().positive('Level 1 approver is required'),
  approverL2Id: z.number().int().positive('Level 2 approver is required'),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export const updateBookingSchema = z.object({
  vehicleId: z.number().int().positive().optional(),
  driverId: z.number().int().positive().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  purpose: z.string().min(1).optional(),
});

export const bookingSchema = z.object({
  id: z.number().int().positive(),
  vehicleId: z.number().int().positive(),
  driverId: z.number().int().positive(),
  requesterId: z.number().int().positive(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  purpose: z.string(),
  status: z.enum([
    BookingStatus.PENDING_L1,
    BookingStatus.PENDING_L2,
    BookingStatus.APPROVED,
    BookingStatus.REJECTED,
    BookingStatus.COMPLETED,
    BookingStatus.CANCELLED,
  ]),
  approverL1Id: z.number().int().positive(),
  approverL2Id: z.number().int().positive(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type Booking = z.infer<typeof bookingSchema>;
