import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingStatusDto, ApproveRejectDto, UpdateBookingDto } from './dto/booking.dto';
import { CurrentUser, Roles } from '../../common/decorators';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all bookings' })
  async findAll(
    @CurrentUser('sub') userId: number,
    @CurrentUser('role') role: string,
    @Query('vehicleId') vehicleId?: number,
    @Query('driverId') driverId?: number,
  ) {
    return this.bookingsService.findAll({ userId, role, vehicleId, driverId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create new booking (Admin only)' })
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @CurrentUser('sub') requesterId: number,
  ) {
    return this.bookingsService.create(createBookingDto, requesterId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update booking details (Requester only, if pending)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateBookingDto,
    @CurrentUser('sub') userId: number,
  ) {
    return this.bookingsService.update(id, updateDto, userId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking (Requester only)' })
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number,
  ) {
    return this.bookingsService.cancel(id, userId);
  }

  @Put(':id/status')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update booking status (complete/cancel)' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, updateDto);
  }

  @Post(':id/approve')
  @Roles('APPROVER_L1', 'APPROVER_L2')
  @ApiOperation({ summary: 'Approve or reject booking' })
  async processApproval(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') approverId: number,
    @Body() approveRejectDto: ApproveRejectDto,
  ) {
    return this.bookingsService.processApproval(id, approverId, approveRejectDto);
  }
}
