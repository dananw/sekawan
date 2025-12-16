import { Injectable, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { eq, desc, and, or, SQL } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.module';
import type { DrizzleDB } from '../../database/database';
import { bookings, vehicles, drivers, users, approvals, regions } from '../../database/schema';
import { CreateBookingDto, UpdateBookingStatusDto, ApproveRejectDto, UpdateBookingDto } from './dto/booking.dto';

@Injectable()
export class BookingsService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async findAll(filters: { userId?: number; role?: string; vehicleId?: number; driverId?: number } = {}) {
    let whereClause: SQL | undefined = undefined;
    const conditions: SQL[] = [];

    if (filters.userId && filters.role !== 'ADMIN') {
      // If not admin, restrict to own bookings or approvals (simplified for now to own bookings for list)
      // Actually existing logic just passed userId. Let's keep it but also query by others.
      // If filtering by vehicle/driver as Admin, userId might be undefined.
      
       // For basic list (requester view):
       if (filters.role !== 'APPROVER_L1' && filters.role !== 'APPROVER_L2') {
          conditions.push(eq(bookings.requesterId, filters.userId));
       }
    }

    if (filters.vehicleId) {
      conditions.push(eq(bookings.vehicleId, filters.vehicleId));
    }

    if (filters.driverId) {
      conditions.push(eq(bookings.driverId, filters.driverId));
    }

    if (conditions.length > 0) {
      whereClause = and(...conditions);
    }

    const result = await this.db
      .select({
        id: bookings.id,
        vehicleId: bookings.vehicleId,
        driverId: bookings.driverId,
        requesterId: bookings.requesterId,
        startDate: bookings.startDate,
        endDate: bookings.endDate,
        purpose: bookings.purpose,
        status: bookings.status,
        approverL1Id: bookings.approverL1Id,
        approverL2Id: bookings.approverL2Id,
        createdAt: bookings.createdAt,
        vehiclePlate: vehicles.plateNumber,
        vehicleBrand: vehicles.brand,
        vehicleModel: vehicles.model,
        driverName: drivers.name,
      })
      .from(bookings)
      .leftJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
      .leftJoin(drivers, eq(bookings.driverId, drivers.id))
      .where(whereClause)
      .orderBy(desc(bookings.createdAt))
      .all();

    return result;
  }

  async findOne(id: number) {
    const booking = await this.db
      .select({
        id: bookings.id,
        vehicleId: bookings.vehicleId,
        driverId: bookings.driverId,
        requesterId: bookings.requesterId,
        startDate: bookings.startDate,
        endDate: bookings.endDate,
        purpose: bookings.purpose,
        status: bookings.status,
        approverL1Id: bookings.approverL1Id,
        approverL2Id: bookings.approverL2Id,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        vehiclePlate: vehicles.plateNumber,
        vehicleBrand: vehicles.brand,
        vehicleModel: vehicles.model,
        vehicleType: vehicles.type,
        driverName: drivers.name,
        driverPhone: drivers.phone,
      })
      .from(bookings)
      .leftJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
      .leftJoin(drivers, eq(bookings.driverId, drivers.id))
      .where(eq(bookings.id, id))
      .get();

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // Get approvals for this booking
    const bookingApprovals = await this.db
      .select({
        id: approvals.id,
        level: approvals.level,
        status: approvals.status,
        notes: approvals.notes,
        decidedAt: approvals.decidedAt,
        approverName: users.name,
        approverEmail: users.email,
      })
      .from(approvals)
      .leftJoin(users, eq(approvals.approverId, users.id))
      .where(eq(approvals.bookingId, id))
      .all();

    return { ...booking, approvals: bookingApprovals };
  }

  async create(createBookingDto: CreateBookingDto, requesterId: number) {
    // Validate vehicle exists and is available
    const vehicle = await this.db.query.vehicles.findFirst({
      where: eq(vehicles.id, createBookingDto.vehicleId),
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.status !== 'AVAILABLE') {
      throw new BadRequestException('Vehicle is not available');
    }

    // Validate driver exists and is available
    const driver = await this.db.query.drivers.findFirst({
      where: eq(drivers.id, createBookingDto.driverId),
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    if (driver.status !== 'AVAILABLE') {
      throw new BadRequestException('Driver is not available');
    }

    // Validate approvers
    const approverL1 = await this.db.query.users.findFirst({
      where: and(eq(users.id, createBookingDto.approverL1Id), eq(users.role, 'APPROVER_L1')),
    });

    if (!approverL1) {
      throw new BadRequestException('Invalid Level 1 approver');
    }

    const approverL2 = await this.db.query.users.findFirst({
      where: and(eq(users.id, createBookingDto.approverL2Id), eq(users.role, 'APPROVER_L2')),
    });

    if (!approverL2) {
      throw new BadRequestException('Invalid Level 2 approver');
    }

    // Create booking
    const [booking] = await this.db
      .insert(bookings)
      .values({
        ...createBookingDto,
        requesterId,
        status: 'PENDING_L1',
      })
      .returning();

    // Create approval entries
    await this.db.insert(approvals).values([
      {
        bookingId: booking.id,
        approverId: createBookingDto.approverL1Id,
        level: 1,
        status: 'PENDING',
      },
      {
        bookingId: booking.id,
        approverId: createBookingDto.approverL2Id,
        level: 2,
        status: 'PENDING',
      },
    ]);

    // Update vehicle and driver status
    await this.db.update(vehicles).set({ status: 'IN_USE' }).where(eq(vehicles.id, createBookingDto.vehicleId));
    await this.db.update(drivers).set({ status: 'ON_DUTY' }).where(eq(drivers.id, createBookingDto.driverId));

    return booking;
  }

  async update(id: number, updateDto: UpdateBookingDto, userId: number) {
    const booking = await this.db.query.bookings.findFirst({
      where: eq(bookings.id, id),
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    if (booking.requesterId !== userId) {
      throw new ForbiddenException('You can only edit your own bookings');
    }

    if (booking.status !== 'PENDING_L1') {
      throw new BadRequestException('Cannot edit booking after it has been approved or rejected');
    }

    const [updated] = await this.db
      .update(bookings)
      .set({
        ...updateDto,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(bookings.id, id))
      .returning();

    return updated;
  }

  async cancel(id: number, userId: number) {
    const booking = await this.db.query.bookings.findFirst({
      where: eq(bookings.id, id),
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // Allow admin or requester to cancel
    // We need to check role in controller or pass it here. 
    // For now assuming userId is requester. If admin, we can skip check or handle in controller.
    // Let's enforce owner check here, and Admin can use updateStatus.
    // Use controller to differentiate.
    
    if (booking.requesterId !== userId) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(booking.status)) {
      throw new BadRequestException('Cannot cancel a completed or rejected booking');
    }

    const [cancelled] = await this.db
      .update(bookings)
      .set({
        status: 'CANCELLED',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(bookings.id, id))
      .returning();

    // Release resources if they were reserved (IN_USE/ON_DUTY)
    await this.db.update(vehicles).set({ status: 'AVAILABLE' }).where(eq(vehicles.id, booking.vehicleId));
    await this.db.update(drivers).set({ status: 'AVAILABLE' }).where(eq(drivers.id, booking.driverId));

    return cancelled;
  }

  async updateStatus(id: number, updateDto: UpdateBookingStatusDto) {
    const booking = await this.db.query.bookings.findFirst({
      where: eq(bookings.id, id),
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    if (updateDto.status === 'COMPLETED' && booking.status !== 'APPROVED') {
      throw new BadRequestException('Only approved bookings can be marked as completed');
    }

    const [updated] = await this.db
      .update(bookings)
      .set({
        status: updateDto.status,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(bookings.id, id))
      .returning();

    // Release vehicle and driver
    await this.db.update(vehicles).set({ status: 'AVAILABLE' }).where(eq(vehicles.id, booking.vehicleId));
    await this.db.update(drivers).set({ status: 'AVAILABLE' }).where(eq(drivers.id, booking.driverId));

    return updated;
  }

  async processApproval(bookingId: number, approverId: number, approveRejectDto: ApproveRejectDto) {
    const booking = await this.db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    // Get the approval record for this approver
    const approval = await this.db.query.approvals.findFirst({
      where: and(eq(approvals.bookingId, bookingId), eq(approvals.approverId, approverId)),
    });

    if (!approval) {
      throw new ForbiddenException('You are not authorized to approve this booking');
    }

    if (approval.status !== 'PENDING') {
      throw new BadRequestException('This approval has already been processed');
    }

    // Check if it's the right turn to approve
    if (approval.level === 1 && booking.status !== 'PENDING_L1') {
      throw new BadRequestException('Level 1 approval not pending');
    }

    if (approval.level === 2 && booking.status !== 'PENDING_L2') {
      throw new BadRequestException('Level 2 approval not pending');
    }

    // Update approval record
    await this.db
      .update(approvals)
      .set({
        status: approveRejectDto.action,
        notes: approveRejectDto.notes || null,
        decidedAt: new Date().toISOString(),
      })
      .where(eq(approvals.id, approval.id));

    // Update booking status based on action and level
    let newStatus: 'PENDING_L1' | 'PENDING_L2' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
    if (approveRejectDto.action === 'REJECTED') {
      newStatus = 'REJECTED';
      // Release vehicle and driver on rejection
      await this.db.update(vehicles).set({ status: 'AVAILABLE' }).where(eq(vehicles.id, booking.vehicleId));
      await this.db.update(drivers).set({ status: 'AVAILABLE' }).where(eq(drivers.id, booking.driverId));
    } else if (approval.level === 1) {
      newStatus = 'PENDING_L2';
    } else {
      newStatus = 'APPROVED';
    }

    const [updatedBooking] = await this.db
      .update(bookings)
      .set({
        status: newStatus,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return updatedBooking;
  }
}
