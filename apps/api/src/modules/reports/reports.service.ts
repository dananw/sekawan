import { Injectable, Inject } from '@nestjs/common';
import { eq, gte, lte, and, desc, type SQL } from 'drizzle-orm';
import * as ExcelJS from 'exceljs';
import { DRIZZLE } from '../../database/database.module';
import type { DrizzleDB } from '../../database/database';
import { bookings, vehicles, drivers } from '../../database/schema';
import { ReportQueryDto } from './dto/report.dto';

@Injectable()
export class ReportsService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async getBookingsReport(query: ReportQueryDto) {
    const conditions: SQL<unknown>[] = [];

    if (query.startDate) {
      conditions.push(gte(bookings.startDate, query.startDate));
    }
    if (query.endDate) {
      conditions.push(lte(bookings.endDate, query.endDate));
    }
    if (query.status) {
      conditions.push(eq(bookings.status, query.status as any));
    }

    const result = await this.db
      .select({
        id: bookings.id,
        vehiclePlate: vehicles.plateNumber,
        vehicleBrand: vehicles.brand,
        vehicleModel: vehicles.model,
        vehicleType: vehicles.type,
        vehicleOwnership: vehicles.ownership,
        driverName: drivers.name,
        driverPhone: drivers.phone,
        startDate: bookings.startDate,
        endDate: bookings.endDate,
        purpose: bookings.purpose,
        status: bookings.status,
        createdAt: bookings.createdAt,
      })
      .from(bookings)
      .leftJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
      .leftJoin(drivers, eq(bookings.driverId, drivers.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(bookings.createdAt))
      .all();

    return result;
  }

  async generateExcelReport(query: ReportQueryDto): Promise<Uint8Array> {
    const data = await this.getBookingsReport(query);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sekawan Fleet';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Bookings Report');

    // Header styling
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Vehicle Plate', key: 'vehiclePlate', width: 15 },
      { header: 'Vehicle', key: 'vehicle', width: 25 },
      { header: 'Type', key: 'vehicleType', width: 12 },
      { header: 'Ownership', key: 'vehicleOwnership', width: 12 },
      { header: 'Driver', key: 'driverName', width: 20 },
      { header: 'Phone', key: 'driverPhone', width: 15 },
      { header: 'Start Date', key: 'startDate', width: 15 },
      { header: 'End Date', key: 'endDate', width: 15 },
      { header: 'Purpose', key: 'purpose', width: 35 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Created At', key: 'createdAt', width: 20 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' },
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Add data rows
    data.forEach((row) => {
      worksheet.addRow({
        id: row.id,
        vehiclePlate: row.vehiclePlate,
        vehicle: `${row.vehicleBrand} ${row.vehicleModel}`,
        vehicleType: row.vehicleType,
        vehicleOwnership: row.vehicleOwnership,
        driverName: row.driverName,
        driverPhone: row.driverPhone,
        startDate: new Date(row.startDate).toLocaleDateString(),
        endDate: new Date(row.endDate).toLocaleDateString(),
        purpose: row.purpose,
        status: row.status,
        createdAt: new Date(row.createdAt).toLocaleString(),
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async getReportSummary(query: ReportQueryDto) {
    const data = await this.getBookingsReport(query);

    const summary = {
      total: data.length,
      byStatus: {
        PENDING_L1: 0,
        PENDING_L2: 0,
        APPROVED: 0,
        REJECTED: 0,
        COMPLETED: 0,
        CANCELLED: 0,
      },
      byVehicleType: {
        PASSENGER: 0,
        CARGO: 0,
      },
      byOwnership: {
        COMPANY: 0,
        RENTAL: 0,
      },
    };

    data.forEach((row) => {
      if (row.status in summary.byStatus) {
        summary.byStatus[row.status as keyof typeof summary.byStatus]++;
      }
      if (row.vehicleType && row.vehicleType in summary.byVehicleType) {
        summary.byVehicleType[row.vehicleType as keyof typeof summary.byVehicleType]++;
      }
      if (row.vehicleOwnership && row.vehicleOwnership in summary.byOwnership) {
        summary.byOwnership[row.vehicleOwnership as keyof typeof summary.byOwnership]++;
      }
    });

    return summary;
  }
}
