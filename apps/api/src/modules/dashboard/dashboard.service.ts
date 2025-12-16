import { Injectable, Inject } from '@nestjs/common';
import { eq, count, sql, and, gte, lte } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.module';
import type { DrizzleDB } from '../../database/database';
import { vehicles, drivers, bookings, fuelLogs } from '../../database/schema';

@Injectable()
export class DashboardService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async getStats() {
    // Total and available vehicles
    const allVehicles = await this.db.select().from(vehicles).all();
    const totalVehicles = allVehicles.length;
    const availableVehicles = allVehicles.filter((v) => v.status === 'AVAILABLE').length;

    // Total and available drivers
    const allDrivers = await this.db.select().from(drivers).all();
    const totalDrivers = allDrivers.length;
    const availableDrivers = allDrivers.filter((d) => d.status === 'AVAILABLE').length;

    // Active and pending bookings
    const allBookings = await this.db.select().from(bookings).all();
    const activeBookings = allBookings.filter((b) => b.status === 'APPROVED').length;
    const pendingApprovals = allBookings.filter((b) => b.status === 'PENDING_L1' || b.status === 'PENDING_L2').length;

    return {
      totalVehicles,
      availableVehicles,
      totalDrivers,
      availableDrivers,
      activeBookings,
      pendingApprovals,
    };
  }

  async getVehicleUsage() {
    const result = await this.db
      .select({
        vehicleId: bookings.vehicleId,
        plateNumber: vehicles.plateNumber,
        brand: vehicles.brand,
        model: vehicles.model,
        usageCount: count(bookings.id),
      })
      .from(bookings)
      .leftJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
      .groupBy(bookings.vehicleId)
      .all();

    return result;
  }

  async getBookingTrends() {
    // Get last 30 days of booking data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const allBookings = await this.db
      .select({
        id: bookings.id,
        createdAt: bookings.createdAt,
        status: bookings.status,
      })
      .from(bookings)
      .where(gte(bookings.createdAt, thirtyDaysAgo.toISOString()))
      .all();

    // Group by date
    const grouped: Record<string, number> = {};
    allBookings.forEach((booking) => {
      const date = booking.createdAt.split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getFuelConsumption() {
    const result = await this.db
      .select({
        vehicleId: fuelLogs.vehicleId,
        plateNumber: vehicles.plateNumber,
        totalLiters: sql<number>`SUM(${fuelLogs.liters})`,
        totalCost: sql<number>`SUM(${fuelLogs.cost})`,
      })
      .from(fuelLogs)
      .leftJoin(vehicles, eq(fuelLogs.vehicleId, vehicles.id))
      .groupBy(fuelLogs.vehicleId)
      .all();

    return result;
  }

  async getRecentBookings(limit: number = 5) {
    const result = await this.db
      .select({
        id: bookings.id,
        purpose: bookings.purpose,
        status: bookings.status,
        startDate: bookings.startDate,
        endDate: bookings.endDate,
        vehiclePlate: vehicles.plateNumber,
        vehicleBrand: vehicles.brand,
        vehicleModel: vehicles.model,
        driverName: drivers.name,
      })
      .from(bookings)
      .leftJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
      .leftJoin(drivers, eq(bookings.driverId, drivers.id))
      .orderBy(sql`${bookings.createdAt} DESC`)
      .limit(limit)
      .all();

    return result;
  }
}
