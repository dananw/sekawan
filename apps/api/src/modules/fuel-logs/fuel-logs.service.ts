import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.module';
import type { DrizzleDB } from '../../database/database';
import { fuelLogs, vehicles } from '../../database/schema';
import { CreateFuelLogDto, UpdateFuelLogDto } from './dto/fuel-log.dto';

@Injectable()
export class FuelLogsService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async create(dto: CreateFuelLogDto) {
    const result = await this.db
      .insert(fuelLogs)
      .values({
        vehicleId: dto.vehicleId,
        liters: dto.liters,
        cost: dto.cost,
        odometer: dto.odometerReading,
        loggedAt: dto.date,
      })
      .returning();

    return result[0];
  }

  async findAll() {
    return this.db
      .select({
        id: fuelLogs.id,
        vehicleId: fuelLogs.vehicleId,
        vehiclePlate: vehicles.plateNumber,
        vehicleBrand: vehicles.brand,
        vehicleModel: vehicles.model,
        liters: fuelLogs.liters,
        cost: fuelLogs.cost,
        odometer: fuelLogs.odometer,
        loggedAt: fuelLogs.loggedAt,
        createdAt: fuelLogs.createdAt,
      })
      .from(fuelLogs)
      .leftJoin(vehicles, eq(fuelLogs.vehicleId, vehicles.id))
      .orderBy(desc(fuelLogs.loggedAt))
      .all();
  }

  async findByVehicle(vehicleId: number) {
    return this.db
      .select()
      .from(fuelLogs)
      .where(eq(fuelLogs.vehicleId, vehicleId))
      .orderBy(desc(fuelLogs.loggedAt))
      .all();
  }

  async findOne(id: number) {
    const result = await this.db
      .select()
      .from(fuelLogs)
      .where(eq(fuelLogs.id, id))
      .get();

    if (!result) {
      throw new NotFoundException('Fuel log not found');
    }

    return result;
  }

  async update(id: number, dto: UpdateFuelLogDto) {
    await this.findOne(id);

    const updateData: Record<string, unknown> = {};
    if (dto.liters !== undefined) updateData.liters = dto.liters;
    if (dto.cost !== undefined) updateData.cost = dto.cost;
    if (dto.odometerReading !== undefined) updateData.odometer = dto.odometerReading;
    if (dto.date !== undefined) updateData.loggedAt = dto.date;

    const result = await this.db
      .update(fuelLogs)
      .set(updateData)
      .where(eq(fuelLogs.id, id))
      .returning();

    return result[0];
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.db.delete(fuelLogs).where(eq(fuelLogs.id, id));
    return { message: 'Fuel log deleted successfully' };
  }
}
