import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { RegionsModule } from './modules/regions/regions.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import { FuelLogsModule } from './modules/fuel-logs/fuel-logs.module';
import { ServiceSchedulesModule } from './modules/service-schedules/service-schedules.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    VehiclesModule,
    DriversModule,
    RegionsModule,
    BookingsModule,
    ApprovalsModule,
    DashboardModule,
    ReportsModule,
    FuelLogsModule,
    ServiceSchedulesModule,
  ],
})
export class AppModule {}

