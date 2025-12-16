import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { vehicles } from './vehicles';
import { bookings } from './bookings';

export const fuelLogs = sqliteTable('fuel_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  vehicleId: integer('vehicle_id')
    .notNull()
    .references(() => vehicles.id),
  bookingId: integer('booking_id').references(() => bookings.id),
  liters: real('liters').notNull(),
  cost: real('cost').notNull(),
  odometer: integer('odometer').notNull(),
  loggedAt: text('logged_at').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type FuelLog = typeof fuelLogs.$inferSelect;
export type NewFuelLog = typeof fuelLogs.$inferInsert;
