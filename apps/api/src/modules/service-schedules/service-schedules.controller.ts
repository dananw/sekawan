import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServiceSchedulesService } from './service-schedules.service';
import { CreateServiceScheduleDto, UpdateServiceScheduleDto } from './dto/service-schedule.dto';
import { Roles } from '../../common/decorators';

@ApiTags('Service Schedules')
@ApiBearerAuth()
@Controller('service-schedules')
export class ServiceSchedulesController {
  constructor(private readonly serviceSchedulesService: ServiceSchedulesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all service schedules' })
  async findAll() {
    return this.serviceSchedulesService.findAll();
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming service schedules' })
  async findUpcoming() {
    return this.serviceSchedulesService.findUpcoming();
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({ summary: 'Get service schedules by vehicle' })
  async findByVehicle(@Param('vehicleId', ParseIntPipe) vehicleId: number) {
    return this.serviceSchedulesService.findByVehicle(vehicleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service schedule by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serviceSchedulesService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create service schedule' })
  async create(@Body() dto: CreateServiceScheduleDto) {
    return this.serviceSchedulesService.create(dto);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update service schedule' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServiceScheduleDto) {
    return this.serviceSchedulesService.update(id, dto);
  }

  @Post(':id/complete')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Mark service as completed' })
  async complete(@Param('id', ParseIntPipe) id: number) {
    return this.serviceSchedulesService.complete(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete service schedule' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.serviceSchedulesService.remove(id);
  }
}
