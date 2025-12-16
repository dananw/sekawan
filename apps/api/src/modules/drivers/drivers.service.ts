import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.module';
import type { DrizzleDB } from '../../database/database';
import { drivers, regions } from '../../database/schema';
import { CreateDriverDto, UpdateDriverDto } from './dto/driver.dto';

@Injectable()
export class DriversService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async findAll() {
    const result = await this.db
      .select({
        id: drivers.id,
        name: drivers.name,
        licenseNumber: drivers.licenseNumber,
        phone: drivers.phone,
        regionId: drivers.regionId,
        status: drivers.status,
        createdAt: drivers.createdAt,
        updatedAt: drivers.updatedAt,
        regionName: regions.name,
        regionType: regions.type,
      })
      .from(drivers)
      .leftJoin(regions, eq(drivers.regionId, regions.id))
      .all();

    return result;
  }

  async findOne(id: number) {
    const result = await this.db
      .select({
        id: drivers.id,
        name: drivers.name,
        licenseNumber: drivers.licenseNumber,
        phone: drivers.phone,
        regionId: drivers.regionId,
        status: drivers.status,
        createdAt: drivers.createdAt,
        updatedAt: drivers.updatedAt,
        regionName: regions.name,
        regionType: regions.type,
      })
      .from(drivers)
      .leftJoin(regions, eq(drivers.regionId, regions.id))
      .where(eq(drivers.id, id))
      .get();

    if (!result) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    return result;
  }

  async findAvailable() {
    return this.db
      .select()
      .from(drivers)
      .where(eq(drivers.status, 'AVAILABLE'))
      .all();
  }

  async create(createDriverDto: CreateDriverDto) {
    // Check if license number already exists
    const existing = await this.db.query.drivers.findFirst({
      where: eq(drivers.licenseNumber, createDriverDto.licenseNumber),
    });

    if (existing) {
      throw new ConflictException('Driver with this license number already exists');
    }

    const [driver] = await this.db
      .insert(drivers)
      .values(createDriverDto)
      .returning();

    return driver;
  }

  async update(id: number, updateDriverDto: UpdateDriverDto) {
    const existing = await this.db.query.drivers.findFirst({
      where: eq(drivers.id, id),
    });

    if (!existing) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    // Check license number uniqueness if being updated
    if (updateDriverDto.licenseNumber && updateDriverDto.licenseNumber !== existing.licenseNumber) {
      const duplicate = await this.db.query.drivers.findFirst({
        where: eq(drivers.licenseNumber, updateDriverDto.licenseNumber),
      });
      if (duplicate) {
        throw new ConflictException('Driver with this license number already exists');
      }
    }

    const [driver] = await this.db
      .update(drivers)
      .set({
        ...updateDriverDto,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(drivers.id, id))
      .returning();

    return driver;
  }

  async remove(id: number) {
    const existing = await this.db.query.drivers.findFirst({
      where: eq(drivers.id, id),
    });

    if (!existing) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    try {
      await this.db.delete(drivers).where(eq(drivers.id, id));
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        throw new ConflictException(
          'Cannot delete driver because they are associated with existing bookings.',
        );
      }
      throw error;
    }

    return { message: 'Driver deleted successfully' };
  }
}
