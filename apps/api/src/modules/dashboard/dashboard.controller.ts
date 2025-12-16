import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getStats() {
    return this.dashboardService.getStats();
  }

  @Get('vehicle-usage')
  @ApiOperation({ summary: 'Get vehicle usage data' })
  async getVehicleUsage() {
    return this.dashboardService.getVehicleUsage();
  }

  @Get('booking-trends')
  @ApiOperation({ summary: 'Get booking trends for last 30 days' })
  async getBookingTrends() {
    return this.dashboardService.getBookingTrends();
  }

  @Get('fuel-consumption')
  @ApiOperation({ summary: 'Get fuel consumption per vehicle' })
  async getFuelConsumption() {
    return this.dashboardService.getFuelConsumption();
  }

  @Get('recent-bookings')
  @ApiOperation({ summary: 'Get recent bookings' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecentBookings(@Query('limit') limit?: number) {
    return this.dashboardService.getRecentBookings(limit || 5);
  }
}
