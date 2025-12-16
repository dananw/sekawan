import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const regions = sqliteTable('regions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', { enum: ['HEADQUARTERS', 'BRANCH', 'MINE'] }).notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type Region = typeof regions.$inferSelect;
export type NewRegion = typeof regions.$inferInsert;
