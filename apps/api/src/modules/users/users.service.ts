import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { eq, or } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { DRIZZLE } from '../../database/database.module';
import type { DrizzleDB } from '../../database/database';
import { users, regions } from '../../database/schema';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async findAll() {
    const result = await this.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        regionId: users.regionId,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        regionName: regions.name,
        regionType: regions.type,
      })
      .from(users)
      .leftJoin(regions, eq(users.regionId, regions.id))
      .all();

    return result;
  }

  async findOne(id: number) {
    const result = await this.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        regionId: users.regionId,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        regionName: regions.name,
        regionType: regions.type,
      })
      .from(users)
      .leftJoin(regions, eq(users.regionId, regions.id))
      .where(eq(users.id, id))
      .get();

    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return result;
  }

  async findApprovers() {
    return this.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        regionId: users.regionId,
      })
      .from(users)
      .where(or(eq(users.role, 'APPROVER_L1'), eq(users.role, 'APPROVER_L2')))
      .all();
  }

  async findApproversByLevel(level: 1 | 2) {
    const role = level === 1 ? 'APPROVER_L1' : 'APPROVER_L2';
    return this.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        regionId: users.regionId,
      })
      .from(users)
      .where(eq(users.role, role))
      .all();
  }

  async create(createUserDto: CreateUserDto) {
    // Check if email already exists
    const existing = await this.db.query.users.findFirst({
      where: eq(users.email, createUserDto.email),
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const [user] = await this.db
      .insert(users)
      .values({
        email: createUserDto.email,
        passwordHash,
        name: createUserDto.name,
        role: createUserDto.role,
        regionId: createUserDto.regionId || null,
      })
      .returning();

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      regionId: user.regionId,
      createdAt: user.createdAt,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const existing = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!existing) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check email uniqueness if being updated
    if (updateUserDto.email && updateUserDto.email !== existing.email) {
      const duplicate = await this.db.query.users.findFirst({
        where: eq(users.email, updateUserDto.email),
      });
      if (duplicate) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (updateUserDto.email) updateData.email = updateUserDto.email;
    if (updateUserDto.name) updateData.name = updateUserDto.name;
    if (updateUserDto.role) updateData.role = updateUserDto.role;
    if (updateUserDto.regionId !== undefined) updateData.regionId = updateUserDto.regionId;
    if (updateUserDto.password) {
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    const [user] = await this.db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      regionId: user.regionId,
      updatedAt: user.updatedAt,
    };
  }

  async remove(id: number) {
    const existing = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!existing) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.db.delete(users).where(eq(users.id, id));

    return { message: 'User deleted successfully' };
  }
}
