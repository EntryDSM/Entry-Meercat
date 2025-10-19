import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { PageType } from '../../../../session/entity/Session.entity';

export class ReportClientErrorRequest {
  @ApiProperty({ description: '세션 ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsOptional()
  sessionId?: string;

  @ApiProperty({ description: '페이지 타입', enum: PageType, example: PageType.USER })
  @IsEnum(PageType)
  @IsOptional()
  pageType?: PageType;

  @ApiProperty({ description: '에러 카테고리', example: 'RUNTIME_ERROR' })
  @IsString()
  @IsOptional()
  errorCategory?: string;

  @ApiProperty({ description: '에러 코드', example: 'ERR_NETWORK' })
  @IsString()
  @IsOptional()
  errorCode?: string;

  @ApiProperty({ description: '에러 메시지', example: 'Network request failed' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ description: '스택 트레이스', example: 'Error: Network request failed\n  at fetch...' })
  @IsString()
  @IsOptional()
  stackTrace?: string;

  @ApiProperty({ description: '페이지 URL', example: '/apply/step1' })
  @IsString()
  @IsOptional()
  pageUrl?: string;

  @ApiProperty({ description: '컴포넌트 이름', example: 'ApplicationForm' })
  @IsString()
  @IsOptional()
  componentName?: string;

  @ApiProperty({ description: '사용자 액션', example: 'SUBMIT_FORM' })
  @IsString()
  @IsOptional()
  userAction?: string;
}
