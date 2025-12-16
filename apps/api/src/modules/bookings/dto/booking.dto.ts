import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsDateString, IsOptional, IsEnum } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  vehicleId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  driverId: number;

  @ApiProperty({ example: '2025-12-20T08:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-12-22T17:00:00.000Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 'Site inspection at Mine A' })
  @IsString()
  purpose: string;

  @ApiProperty({ example: 2, description: 'Approver Level 1 user ID' })
  @IsNumber()
  approverL1Id: number;

  @ApiProperty({ example: 3, description: 'Approver Level 2 user ID' })
  @IsNumber()
  approverL2Id: number;
}

export class UpdateBookingDto {
  @ApiPropertyOptional({ example: '2025-12-20T08:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-12-22T17:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 'Updated purpose' })
  @IsOptional()
  @IsString()
  purpose?: string;
}

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: ['COMPLETED', 'CANCELLED'] })
  @IsEnum(['COMPLETED', 'CANCELLED'])
  status: 'COMPLETED' | 'CANCELLED';
}

export class ApproveRejectDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsEnum(['APPROVED', 'REJECTED'])
  action: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({ example: 'Approved for project needs' })
  @IsOptional()
  @IsString()
  notes?: string;
}
