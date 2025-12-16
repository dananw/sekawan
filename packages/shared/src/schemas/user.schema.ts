import { z } from 'zod';
import { UserRole } from '../constants/roles';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum([UserRole.ADMIN, UserRole.APPROVER_L1, UserRole.APPROVER_L2]),
  regionId: z.number().int().positive().optional(),
});

export const userSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum([UserRole.ADMIN, UserRole.APPROVER_L1, UserRole.APPROVER_L2]),
  regionId: z.number().int().positive().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  role: z.enum([UserRole.ADMIN, UserRole.APPROVER_L1, UserRole.APPROVER_L2]).optional(),
  regionId: z.number().int().positive().nullable().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type User = z.infer<typeof userSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
