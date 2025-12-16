import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsDateString, IsOptional, IsString, IsIn } from 'class-validator';

export class CreateServiceScheduleDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  vehicleId: number;

  @ApiProperty({ example: 'OIL_CHANGE', enum: ['OIL_CHANGE', 'TIRE_ROTATION', 'BRAKE_SERVICE', 'FULL_SERVICE', 'OTHER'] })
  @IsString()
  @IsIn(['OIL_CHANGE', 'TIRE_ROTATION', 'BRAKE_SERVICE', 'FULL_SERVICE', 'OTHER'])
  serviceType: string;

  @ApiProperty({ example: '2025-02-15' })
  @IsDateString()
  @IsNotEmpty()
  scheduledDate: string;

  @ApiPropertyOptional({ example: 'Engine oil and filter replacement' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 500000 })
  @IsNumber()
  @IsOptional()
  cost?: number;

  @ApiPropertyOptional({ example: 15000 })
  @IsNumber()
  @IsOptional()
  odometerReading?: number;
}

export class UpdateServiceScheduleDto {
  @ApiPropertyOptional()
  @IsString()
  @IsIn(['OIL_CHANGE', 'TIRE_ROTATION', 'BRAKE_SERVICE', 'FULL_SERVICE', 'OTHER'])
  @IsOptional()
  serviceType?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  scheduledDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  completedDate?: string;

  @ApiPropertyOptional({ enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'] })
  @IsString()
  @IsIn(['SCHEDULED', 'COMPLETED', 'CANCELLED'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  cost?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  odometerReading?: number;
}
