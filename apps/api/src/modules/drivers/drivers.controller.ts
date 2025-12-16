import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { CreateDriverDto, UpdateDriverDto } from './dto/driver.dto';
import { Roles } from '../../common/decorators';

@ApiTags('Drivers')
@ApiBearerAuth()
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @ApiOperation({ summary: 'Get all drivers' })
  async findAll() {
    return this.driversService.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available drivers' })
  async findAvailable() {
    return this.driversService.findAvailable();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get driver by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.driversService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create new driver (Admin only)' })
  async create(@Body() createDriverDto: CreateDriverDto) {
    return this.driversService.create(createDriverDto);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update driver (Admin only)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDriverDto: UpdateDriverDto,
  ) {
    return this.driversService.update(id, updateDriverDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete driver (Admin only)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.driversService.remove(id);
  }
}
