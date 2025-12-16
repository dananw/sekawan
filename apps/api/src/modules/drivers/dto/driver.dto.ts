import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreateDriverDto {
  @ApiProperty({ example: 'Budi Santoso' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'SIM-001-2024' })
  @IsString()
  licenseNumber: string;

  @ApiProperty({ example: '+6281234567890' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  regionId: number;
}

export class UpdateDriverDto {
  @ApiPropertyOptional({ example: 'Budi Santoso' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'SIM-001-2024' })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiPropertyOptional({ example: '+6281234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  regionId?: number;

  @ApiPropertyOptional({ enum: ['AVAILABLE', 'ON_DUTY', 'OFF'] })
  @IsOptional()
  @IsEnum(['AVAILABLE', 'ON_DUTY', 'OFF'])
  status?: 'AVAILABLE' | 'ON_DUTY' | 'OFF';
}
