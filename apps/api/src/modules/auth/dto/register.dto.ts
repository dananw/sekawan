import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsNumber } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@sekawan.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ enum: ['ADMIN', 'APPROVER_L1', 'APPROVER_L2'] })
  @IsEnum(['ADMIN', 'APPROVER_L1', 'APPROVER_L2'])
  role: 'ADMIN' | 'APPROVER_L1' | 'APPROVER_L2';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  regionId?: number;
}
