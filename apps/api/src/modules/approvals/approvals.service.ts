import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.module';
import type { DrizzleDB } from '../../database/database';
import { approvals, bookings, vehicles, drivers, users } from '../../database/schema';

@Injectable()
export class ApprovalsService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async findPendingForUser(userId: number, role: string) {
    const isAdmin = role === 'ADMIN';
    
    let whereCondition = eq(approvals.status, 'PENDING');
    if (!isAdmin) {
      whereCondition = and(eq(approvals.approverId, userId), eq(approvals.status, 'PENDING'))!;
    }

    const result = await this.db
      .select({
        approvalId: approvals.id,
        bookingId: approvals.bookingId,
        level: approvals.level,
        approvalStatus: approvals.status,
        createdAt: approvals.createdAt,
        bookingStatus: bookings.status,
        purpose: bookings.purpose,
        startDate: bookings.startDate,
        endDate: bookings.endDate,
        vehiclePlate: vehicles.plateNumber,
        vehicleBrand: vehicles.brand,
        vehicleModel: vehicles.model,
        driverName: drivers.name,
      })
      .from(approvals)
      .innerJoin(bookings, eq(approvals.bookingId, bookings.id))
      .leftJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
      .leftJoin(drivers, eq(bookings.driverId, drivers.id))
      .where(whereCondition)
      .orderBy(desc(approvals.createdAt))
      .all();

    // Filter based on booking status
    // For Admin, show all pending approvals that match the booking status (L1 pending for L1 approval, etc.)
    return result.filter((r) => {
      if (r.level === 1) return r.bookingStatus === 'PENDING_L1';
      if (r.level === 2) return r.bookingStatus === 'PENDING_L2';
      return false;
    });
  }

  async findHistory(userId: number, role: string) {
    const isAdmin = role === 'ADMIN';
    const whereCondition = isAdmin ? undefined : eq(approvals.approverId, userId);

    const result = await this.db
      .select({
        approvalId: approvals.id,
        bookingId: approvals.bookingId,
        level: approvals.level,
        approvalStatus: approvals.status,
        notes: approvals.notes,
        decidedAt: approvals.decidedAt,
        createdAt: approvals.createdAt,
        purpose: bookings.purpose,
        startDate: bookings.startDate,
        endDate: bookings.endDate,
        vehiclePlate: vehicles.plateNumber,
        vehicleBrand: vehicles.brand,
        vehicleModel: vehicles.model,
        driverName: drivers.name,
        approverName: users.name,
      })
      .from(approvals)
      .innerJoin(bookings, eq(approvals.bookingId, bookings.id))
      .leftJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
      .leftJoin(drivers, eq(bookings.driverId, drivers.id))
      .leftJoin(users, eq(approvals.approverId, users.id))
      .where(whereCondition)
      .orderBy(desc(approvals.decidedAt))
      .all();

    return result;
  }

  async countPendingForUser(userId: number, role: string) {
    const pending = await this.findPendingForUser(userId, role);
    return { count: pending.length };
  }
}
