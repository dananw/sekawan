import { z } from 'zod';
import { RegionType } from '../constants/vehicle';

export const createRegionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum([RegionType.HEADQUARTERS, RegionType.BRANCH, RegionType.MINE]),
});

export const regionSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  type: z.enum([RegionType.HEADQUARTERS, RegionType.BRANCH, RegionType.MINE]),
  createdAt: z.string().datetime(),
});

export type CreateRegionInput = z.infer<typeof createRegionSchema>;
export type Region = z.infer<typeof regionSchema>;
