import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { vehicles } from './vehicles';
import { drivers } from './drivers';
import { users } from './users';

export const bookings = sqliteTable('bookings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  vehicleId: integer('vehicle_id')
    .notNull()
    .references(() => vehicles.id),
  driverId: integer('driver_id')
    .notNull()
    .references(() => drivers.id),
  requesterId: integer('requester_id')
    .notNull()
    .references(() => users.id),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  purpose: text('purpose').notNull(),
  status: text('status', {
    enum: ['PENDING_L1', 'PENDING_L2', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'],
  })
    .notNull()
    .default('PENDING_L1'),
  approverL1Id: integer('approver_l1_id')
    .notNull()
    .references(() => users.id),
  approverL2Id: integer('approver_l2_id')
    .notNull()
    .references(() => users.id),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
