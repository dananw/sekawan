import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsDateString, IsOptional, IsString, Min } from 'class-validator';

export class CreateFuelLogDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  vehicleId: number;

  @ApiProperty({ example: '2025-01-15' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 50.5 })
  @IsNumber()
  @Min(0)
  liters: number;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @Min(0)
  cost: number;

  @ApiProperty({ example: 45000 })
  @IsNumber()
  @Min(0)
  odometerReading: number;

  @ApiPropertyOptional({ example: 'Filled at Pertamina SPBU' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateFuelLogDto {
  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  liters?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  cost?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  odometerReading?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
