import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({ example: 'B 1234 ABC' })
  @IsString()
  plateNumber: string;

  @ApiProperty({ example: 'Toyota' })
  @IsString()
  brand: string;

  @ApiProperty({ example: 'Hilux' })
  @IsString()
  model: string;

  @ApiProperty({ enum: ['PASSENGER', 'CARGO'] })
  @IsEnum(['PASSENGER', 'CARGO'])
  type: 'PASSENGER' | 'CARGO';

  @ApiProperty({ enum: ['COMPANY', 'RENTAL'] })
  @IsEnum(['COMPANY', 'RENTAL'])
  ownership: 'COMPANY' | 'RENTAL';

  @ApiPropertyOptional({ example: 'PT Rental Jaya' })
  @IsOptional()
  @IsString()
  rentalCompany?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  regionId: number;
}

export class UpdateVehicleDto {
  @ApiPropertyOptional({ example: 'B 1234 ABC' })
  @IsOptional()
  @IsString()
  plateNumber?: string;

  @ApiPropertyOptional({ example: 'Toyota' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 'Hilux' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ enum: ['PASSENGER', 'CARGO'] })
  @IsOptional()
  @IsEnum(['PASSENGER', 'CARGO'])
  type?: 'PASSENGER' | 'CARGO';

  @ApiPropertyOptional({ enum: ['COMPANY', 'RENTAL'] })
  @IsOptional()
  @IsEnum(['COMPANY', 'RENTAL'])
  ownership?: 'COMPANY' | 'RENTAL';

  @ApiPropertyOptional({ example: 'PT Rental Jaya' })
  @IsOptional()
  @IsString()
  rentalCompany?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  regionId?: number;

  @ApiPropertyOptional({ enum: ['AVAILABLE', 'IN_USE', 'MAINTENANCE'] })
  @IsOptional()
  @IsEnum(['AVAILABLE', 'IN_USE', 'MAINTENANCE'])
  status?: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
}
