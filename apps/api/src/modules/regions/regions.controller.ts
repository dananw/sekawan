import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RegionsService } from './regions.service';

@ApiTags('Regions')
@ApiBearerAuth()
@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all regions' })
  async findAll() {
    return this.regionsService.findAll();
  }
}
