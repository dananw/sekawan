import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.module';
import type { DrizzleDB } from '../../database/database';
import { vehicles, regions } from '../../database/schema';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async findAll() {
    const result = await this.db
      .select({
        id: vehicles.id,
        plateNumber: vehicles.plateNumber,
        brand: vehicles.brand,
        model: vehicles.model,
        type: vehicles.type,
        ownership: vehicles.ownership,
        rentalCompany: vehicles.rentalCompany,
        regionId: vehicles.regionId,
        status: vehicles.status,
        createdAt: vehicles.createdAt,
        updatedAt: vehicles.updatedAt,
        regionName: regions.name,
        regionType: regions.type,
      })
      .from(vehicles)
      .leftJoin(regions, eq(vehicles.regionId, regions.id))
      .all();

    return result;
  }

  async findOne(id: number) {
    const result = await this.db
      .select({
        id: vehicles.id,
        plateNumber: vehicles.plateNumber,
        brand: vehicles.brand,
        model: vehicles.model,
        type: vehicles.type,
        ownership: vehicles.ownership,
        rentalCompany: vehicles.rentalCompany,
        regionId: vehicles.regionId,
        status: vehicles.status,
        createdAt: vehicles.createdAt,
        updatedAt: vehicles.updatedAt,
        regionName: regions.name,
        regionType: regions.type,
      })
      .from(vehicles)
      .leftJoin(regions, eq(vehicles.regionId, regions.id))
      .where(eq(vehicles.id, id))
      .get();

    if (!result) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    return result;
  }

  async findAvailable() {
    return this.db
      .select()
      .from(vehicles)
      .where(eq(vehicles.status, 'AVAILABLE'))
      .all();
  }

  async create(createVehicleDto: CreateVehicleDto) {
    // Check if plate number already exists
    const existing = await this.db.query.vehicles.findFirst({
      where: eq(vehicles.plateNumber, createVehicleDto.plateNumber),
    });

    if (existing) {
      throw new ConflictException('Vehicle with this plate number already exists');
    }

    const [vehicle] = await this.db
      .insert(vehicles)
      .values({
        ...createVehicleDto,
        rentalCompany: createVehicleDto.rentalCompany || null,
      })
      .returning();

    return vehicle;
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto) {
    const existing = await this.db.query.vehicles.findFirst({
      where: eq(vehicles.id, id),
    });

    if (!existing) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    // Check plate number uniqueness if being updated
    if (updateVehicleDto.plateNumber && updateVehicleDto.plateNumber !== existing.plateNumber) {
      const duplicate = await this.db.query.vehicles.findFirst({
        where: eq(vehicles.plateNumber, updateVehicleDto.plateNumber),
      });
      if (duplicate) {
        throw new ConflictException('Vehicle with this plate number already exists');
      }
    }

    const [vehicle] = await this.db
      .update(vehicles)
      .set({
        ...updateVehicleDto,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(vehicles.id, id))
      .returning();

    return vehicle;
  }

  async remove(id: number) {
    const existing = await this.db.query.vehicles.findFirst({
      where: eq(vehicles.id, id),
    });

    if (!existing) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    try {
      await this.db.delete(vehicles).where(eq(vehicles.id, id));
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        throw new ConflictException(
          'Cannot delete vehicle because it is associated with existing bookings or service schedules.',
        );
      }
      throw error;
    }

    return { message: 'Vehicle deleted successfully' };
  }
}
