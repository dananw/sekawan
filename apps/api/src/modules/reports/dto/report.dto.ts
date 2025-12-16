import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsEnum } from 'class-validator';

export class ReportQueryDto {
  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: ['PENDING_L1', 'PENDING_L2', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'] })
  @IsOptional()
  @IsEnum(['PENDING_L1', 'PENDING_L2', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'])
  status?: string;
}
