import { ApiProperty } from '@nestjs/swagger';
import { ErrorType } from '../../../entity/ErrorType.enum';

export class ErrorItemResponse {
  @ApiProperty({ description: '에러 ID', example: 12345 })
  id: number;

  @ApiProperty({ description: '에러 타입', enum: ErrorType, example: ErrorType.CLIENT })
  errorType: ErrorType;

  @ApiProperty({ description: '세션 ID', example: 'uuid-string', nullable: true })
  sessionId: string | null;

  @ApiProperty({ description: '페이지 타입', example: 'USER', nullable: true })
  pageType: string | null;

  @ApiProperty({ description: '에러 카테고리', example: 'NETWORK_ERROR', nullable: true })
  errorCategory: string | null;

  @ApiProperty({ description: '에러 코드', example: 'ERR_001', nullable: true })
  errorCode: string | null;

  @ApiProperty({ description: '에러 메시지', example: 'Failed to load resource', nullable: true })
  message: string | null;

  @ApiProperty({ description: '엔드포인트 (SERVER만)', example: '/api/v1/users', nullable: true })
  endpoint?: string | null;

  @ApiProperty({ description: 'HTTP 메서드 (SERVER만)', example: 'GET', nullable: true })
  httpMethod?: string | null;

  @ApiProperty({ description: 'HTTP 상태 코드 (SERVER만)', example: 500, nullable: true })
  httpStatus?: number | null;

  @ApiProperty({ description: '생성 시간', example: '2025-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ description: '해결 여부 (CRITICAL만)', example: false, nullable: true })
  resolved?: boolean | null;

  @ApiProperty({ description: '해결 시간 (CRITICAL만)', example: '2025-01-15T11:00:00Z', nullable: true })
  resolvedAt?: Date | null;
}

export class PaginationMetaResponse {
  @ApiProperty({ description: '현재 페이지', example: 1 })
  currentPage: number;

  @ApiProperty({ description: '페이지 크기', example: 20 })
  pageSize: number;

  @ApiProperty({ description: '전체 항목 수', example: 150 })
  totalItems: number;

  @ApiProperty({ description: '전체 페이지 수', example: 8 })
  totalPages: number;
}

export class GetErrorsResponse {
  @ApiProperty({ description: '에러 목록', type: [ErrorItemResponse] })
  errors: ErrorItemResponse[];

  @ApiProperty({ description: '페이지네이션 메타 정보', type: PaginationMetaResponse })
  meta: PaginationMetaResponse;
}
