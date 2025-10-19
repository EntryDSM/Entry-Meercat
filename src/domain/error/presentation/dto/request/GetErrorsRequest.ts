import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ErrorType, ErrorResolutionStatus } from '../../../entity/ErrorType.enum';

export class GetErrorsRequest {
  @ApiProperty({ description: '페이지 번호', example: 1, default: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @ApiProperty({ description: '페이지 크기', example: 20, default: 20 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit: number = 20;

  @ApiProperty({
    description: '에러 타입',
    enum: ErrorType,
    required: false,
    example: ErrorType.CLIENT,
  })
  @IsEnum(ErrorType)
  @IsOptional()
  errorType?: ErrorType;

  @ApiProperty({
    description: '해결 상태 (CRITICAL 타입만 해당)',
    enum: ErrorResolutionStatus,
    required: false,
    example: ErrorResolutionStatus.UNRESOLVED,
  })
  @IsEnum(ErrorResolutionStatus)
  @IsOptional()
  resolutionStatus?: ErrorResolutionStatus;

  @ApiProperty({
    description: '시작 날짜 (ISO 8601)',
    required: false,
    example: '2025-01-01T00:00:00Z',
  })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    description: '종료 날짜 (ISO 8601)',
    required: false,
    example: '2025-12-31T23:59:59Z',
  })
  @IsString()
  @IsOptional()
  endDate?: string;
}
