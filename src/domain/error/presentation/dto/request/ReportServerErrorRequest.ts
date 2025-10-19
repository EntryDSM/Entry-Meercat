import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { PageType } from '../../../../session/entity/Session.entity';

export class ReportServerErrorRequest {
  @ApiProperty({ description: '세션 ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsOptional()
  sessionId?: string;

  @ApiProperty({ description: '페이지 타입', enum: PageType, example: PageType.AUTH })
  @IsEnum(PageType)
  @IsOptional()
  pageType?: PageType;

  @ApiProperty({ description: '엔드포인트', example: '/api/v1/auth/login' })
  @IsString()
  @IsOptional()
  endpoint?: string;

  @ApiProperty({ description: 'HTTP 메서드', example: 'POST' })
  @IsString()
  @IsOptional()
  httpMethod?: string;

  @ApiProperty({ description: 'HTTP 상태 코드', example: 500 })
  @IsNumber()
  @IsOptional()
  httpStatus?: number;

  @ApiProperty({ description: '에러 카테고리', example: 'SERVER_ERROR' })
  @IsString()
  @IsOptional()
  errorCategory?: string;

  @ApiProperty({ description: '에러 코드', example: 'INTERNAL_SERVER_ERROR' })
  @IsString()
  @IsOptional()
  errorCode?: string;

  @ApiProperty({ description: '에러 메시지', example: 'Database connection failed' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ description: '스택 트레이스', example: 'Error: Database connection failed\n  at...' })
  @IsString()
  @IsOptional()
  stackTrace?: string;

  @ApiProperty({ description: '요청 페이로드', example: '{"username":"test"}' })
  @IsString()
  @IsOptional()
  requestPayload?: string;

  @ApiProperty({ description: '응답 시간(ms)', example: 1250 })
  @IsNumber()
  @IsOptional()
  responseTime?: number;
}
