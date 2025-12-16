import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { regions } from './regions';

export const drivers = sqliteTable('drivers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  licenseNumber: text('license_number').notNull().unique(),
  phone: text('phone').notNull(),
  regionId: integer('region_id')
    .notNull()
    .references(() => regions.id),
  status: text('status', { enum: ['AVAILABLE', 'ON_DUTY', 'OFF'] })
    .notNull()
    .default('AVAILABLE'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type Driver = typeof drivers.$inferSelect;
export type NewDriver = typeof drivers.$inferInsert;
