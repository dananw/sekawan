import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { bookings } from './bookings';
import { users } from './users';

export const approvals = sqliteTable('approvals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookingId: integer('booking_id')
    .notNull()
    .references(() => bookings.id),
  approverId: integer('approver_id')
    .notNull()
    .references(() => users.id),
  level: integer('level').notNull(), // 1 or 2
  status: text('status', { enum: ['PENDING', 'APPROVED', 'REJECTED'] })
    .notNull()
    .default('PENDING'),
  notes: text('notes'),
  decidedAt: text('decided_at'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type Approval = typeof approvals.$inferSelect;
export type NewApproval = typeof approvals.$inferInsert;
