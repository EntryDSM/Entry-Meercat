import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetApiLogsRequest {
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
    description: '세션 ID',
    required: false,
    example: 'uuid-string',
  })
  @IsString()
  @IsOptional()
  sessionId?: string;

  @ApiProperty({
    description: '엔드포인트',
    required: false,
    example: '/v1/session/start',
  })
  @IsString()
  @IsOptional()
  endpoint?: string;

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
