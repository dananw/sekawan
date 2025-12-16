import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { vehicles } from './vehicles';

export const serviceSchedules = sqliteTable('service_schedules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  vehicleId: integer('vehicle_id')
    .notNull()
    .references(() => vehicles.id),
  type: text('type', { enum: ['ROUTINE', 'REPAIR', 'OIL_CHANGE', 'TIRE_ROTATION', 'BRAKE_SERVICE', 'FULL_SERVICE', 'OTHER'] }).notNull(),
  description: text('description').notNull(),
  scheduledDate: text('scheduled_date').notNull(),
  completedDate: text('completed_date'),
  odometerReading: integer('odometer_reading'),
  cost: real('cost'),
  status: text('status', { enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
    .notNull()
    .default('SCHEDULED'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type ServiceSchedule = typeof serviceSchedules.$inferSelect;
export type NewServiceSchedule = typeof serviceSchedules.$inferInsert;
