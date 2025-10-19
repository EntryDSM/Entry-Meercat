import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { PageType } from '../../../../session/entity/Session.entity';

export class ReportCriticalErrorRequest {
  @ApiProperty({ description: '세션 ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsOptional()
  sessionId?: string;

  @ApiProperty({ description: '페이지 타입', enum: PageType, example: PageType.ADMISSION })
  @IsEnum(PageType)
  @IsOptional()
  pageType?: PageType;

  @ApiProperty({ description: '에러 카테고리', example: 'CRITICAL_FAILURE' })
  @IsString()
  @IsOptional()
  errorCategory?: string;

  @ApiProperty({ description: '에러 코드', example: 'PAYMENT_FAILURE' })
  @IsString()
  @IsOptional()
  errorCode?: string;

  @ApiProperty({ description: '에러 메시지', example: 'Payment processing failed' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ description: '스택 트레이스', example: 'Error: Payment processing failed\n  at...' })
  @IsString()
  @IsOptional()
  stackTrace?: string;

  @ApiProperty({ description: '컨텍스트 정보', example: '{"orderId":"12345","amount":50000}' })
  @IsString()
  @IsOptional()
  context?: string;

  @ApiProperty({ description: '사용자 영향도', example: 'HIGH' })
  @IsString()
  @IsOptional()
  userImpact?: string;
}
