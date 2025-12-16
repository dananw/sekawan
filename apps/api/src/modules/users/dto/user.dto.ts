import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsNumber, IsOptional, IsEnum, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@sekawan.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ['ADMIN', 'APPROVER_L1', 'APPROVER_L2'] })
  @IsEnum(['ADMIN', 'APPROVER_L1', 'APPROVER_L2'])
  role: 'ADMIN' | 'APPROVER_L1' | 'APPROVER_L2';

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  regionId?: number;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'user@sekawan.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'password123' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: ['ADMIN', 'APPROVER_L1', 'APPROVER_L2'] })
  @IsOptional()
  @IsEnum(['ADMIN', 'APPROVER_L1', 'APPROVER_L2'])
  role?: 'ADMIN' | 'APPROVER_L1' | 'APPROVER_L2';

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  regionId?: number;
}
