import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, desc, and, gte } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.module';
import type { DrizzleDB } from '../../database/database';
import { serviceSchedules, vehicles } from '../../database/schema';
import { CreateServiceScheduleDto, UpdateServiceScheduleDto } from './dto/service-schedule.dto';

type ServiceType = 'ROUTINE' | 'REPAIR' | 'OIL_CHANGE' | 'TIRE_ROTATION' | 'BRAKE_SERVICE' | 'FULL_SERVICE' | 'OTHER';
type ServiceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

@Injectable()
export class ServiceSchedulesService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async create(dto: CreateServiceScheduleDto) {
    const result = await this.db
      .insert(serviceSchedules)
      .values({
        vehicleId: dto.vehicleId,
        type: dto.serviceType as ServiceType,
        description: dto.description || dto.serviceType,
        scheduledDate: dto.scheduledDate,
        cost: dto.cost,
        odometerReading: dto.odometerReading,
        status: 'SCHEDULED',
      })
      .returning();

    return result[0];
  }

  async findAll() {
    return this.db
      .select({
        id: serviceSchedules.id,
        vehicleId: serviceSchedules.vehicleId,
        vehiclePlate: vehicles.plateNumber,
        vehicleBrand: vehicles.brand,
        vehicleModel: vehicles.model,
        type: serviceSchedules.type,
        scheduledDate: serviceSchedules.scheduledDate,
        completedDate: serviceSchedules.completedDate,
        status: serviceSchedules.status,
        description: serviceSchedules.description,
        cost: serviceSchedules.cost,
        odometerReading: serviceSchedules.odometerReading,
        createdAt: serviceSchedules.createdAt,
      })
      .from(serviceSchedules)
      .leftJoin(vehicles, eq(serviceSchedules.vehicleId, vehicles.id))
      .orderBy(desc(serviceSchedules.scheduledDate))
      .all();
  }

  async findUpcoming() {
    const today = new Date().toISOString().split('T')[0];
    return this.db
      .select({
        id: serviceSchedules.id,
        vehicleId: serviceSchedules.vehicleId,
        vehiclePlate: vehicles.plateNumber,
        vehicleBrand: vehicles.brand,
        vehicleModel: vehicles.model,
        type: serviceSchedules.type,
        scheduledDate: serviceSchedules.scheduledDate,
        status: serviceSchedules.status,
        description: serviceSchedules.description,
        cost: serviceSchedules.cost,
        odometerReading: serviceSchedules.odometerReading,
      })
      .from(serviceSchedules)
      .leftJoin(vehicles, eq(serviceSchedules.vehicleId, vehicles.id))
      .where(and(
        eq(serviceSchedules.status, 'SCHEDULED'),
        gte(serviceSchedules.scheduledDate, today)
      ))
      .orderBy(serviceSchedules.scheduledDate)
      .all();
  }

  async findByVehicle(vehicleId: number) {
    return this.db
      .select()
      .from(serviceSchedules)
      .where(eq(serviceSchedules.vehicleId, vehicleId))
      .orderBy(desc(serviceSchedules.scheduledDate))
      .all();
  }

  async findOne(id: number) {
    const result = await this.db
      .select()
      .from(serviceSchedules)
      .where(eq(serviceSchedules.id, id))
      .get();

    if (!result) {
      throw new NotFoundException('Service schedule not found');
    }

    return result;
  }

  async update(id: number, dto: UpdateServiceScheduleDto) {
    await this.findOne(id);

    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    
    if (dto.serviceType) updateData.type = dto.serviceType;
    if (dto.scheduledDate) updateData.scheduledDate = dto.scheduledDate;
    if (dto.completedDate) updateData.completedDate = dto.completedDate;
    if (dto.status) updateData.status = dto.status as ServiceStatus;
    if (dto.description) updateData.description = dto.description;
    if (dto.cost !== undefined) updateData.cost = dto.cost;
    if (dto.odometerReading !== undefined) updateData.odometerReading = dto.odometerReading;

    const result = await this.db
      .update(serviceSchedules)
      .set(updateData)
      .where(eq(serviceSchedules.id, id))
      .returning();

    return result[0];
  }

  async complete(id: number) {
    await this.findOne(id);

    const result = await this.db
      .update(serviceSchedules)
      .set({
        status: 'COMPLETED',
        completedDate: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString(),
      })
      .where(eq(serviceSchedules.id, id))
      .returning();

    return result[0];
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.db.delete(serviceSchedules).where(eq(serviceSchedules.id, id));
    return { message: 'Service schedule deleted successfully' };
  }
}
