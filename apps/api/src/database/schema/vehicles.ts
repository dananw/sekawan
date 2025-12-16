import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { regions } from './regions';

export const vehicles = sqliteTable('vehicles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  plateNumber: text('plate_number').notNull().unique(),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  type: text('type', { enum: ['PASSENGER', 'CARGO'] }).notNull(),
  ownership: text('ownership', { enum: ['COMPANY', 'RENTAL'] }).notNull(),
  rentalCompany: text('rental_company'),
  regionId: integer('region_id')
    .notNull()
    .references(() => regions.id),
  status: text('status', { enum: ['AVAILABLE', 'IN_USE', 'MAINTENANCE'] })
    .notNull()
    .default('AVAILABLE'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
