import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FuelLogsService } from './fuel-logs.service';
import { CreateFuelLogDto, UpdateFuelLogDto } from './dto/fuel-log.dto';
import { Roles } from '../../common/decorators';

@ApiTags('Fuel Logs')
@ApiBearerAuth()
@Controller('fuel-logs')
export class FuelLogsController {
  constructor(private readonly fuelLogsService: FuelLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all fuel logs' })
  async findAll() {
    return this.fuelLogsService.findAll();
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({ summary: 'Get fuel logs by vehicle' })
  async findByVehicle(@Param('vehicleId', ParseIntPipe) vehicleId: number) {
    return this.fuelLogsService.findByVehicle(vehicleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get fuel log by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fuelLogsService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create fuel log' })
  async create(@Body() dto: CreateFuelLogDto) {
    return this.fuelLogsService.create(dto);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update fuel log' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFuelLogDto) {
    return this.fuelLogsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete fuel log' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.fuelLogsService.remove(id);
  }
}
