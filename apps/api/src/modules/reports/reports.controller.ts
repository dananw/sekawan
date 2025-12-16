import { Controller, Get, Query, Res, StreamableFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dto/report.dto';
import { Roles } from '../../common/decorators';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('bookings')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get bookings report data' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'status', required: false })
  async getBookingsReport(@Query() query: ReportQueryDto) {
    return this.reportsService.getBookingsReport(query);
  }

  @Get('bookings/summary')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get bookings report summary' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'status', required: false })
  async getReportSummary(@Query() query: ReportQueryDto) {
    return this.reportsService.getReportSummary(query);
  }

  @Get('bookings/export')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Export bookings report as Excel' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'status', required: false })
  async exportBookingsReport(
    @Query() query: ReportQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const buffer = await this.reportsService.generateExcelReport(query);

    const filename = `bookings-report-${new Date().toISOString().split('T')[0]}.xlsx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return new StreamableFile(buffer);
  }
}
