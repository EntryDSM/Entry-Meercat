import { ApiProperty } from '@nestjs/swagger';

export class ApiLogItemResponse {
  @ApiProperty({ description: 'API 로그 ID', example: 12345 })
  id: number;

  @ApiProperty({ description: '세션 ID', example: 'uuid-string', nullable: true })
  sessionId: string | null;

  @ApiProperty({ description: '엔드포인트', example: '/v1/session/start', nullable: true })
  endpoint: string | null;

  @ApiProperty({ description: 'HTTP 메서드', example: 'POST', nullable: true })
  method: string | null;

  @ApiProperty({ description: 'HTTP 상태 코드', example: 200, nullable: true })
  statusCode: number | null;

  @ApiProperty({ description: '응답 시간 (ms)', example: 150, nullable: true })
  responseTime: number | null;

  @ApiProperty({ description: '요청 크기 (bytes)', example: 1024, nullable: true })
  requestSize: number | null;

  @ApiProperty({ description: '응답 크기 (bytes)', example: 2048, nullable: true })
  responseSize: number | null;

  @ApiProperty({ description: '생성 시간', example: '2025-01-15T10:30:00Z' })
  createdAt: Date;
}

export class ApiLogPaginationMeta {
  @ApiProperty({ description: '현재 페이지', example: 1 })
  currentPage: number;

  @ApiProperty({ description: '페이지 크기', example: 20 })
  pageSize: number;

  @ApiProperty({ description: '전체 항목 수', example: 150 })
  totalItems: number;

  @ApiProperty({ description: '전체 페이지 수', example: 8 })
  totalPages: number;
}

export class GetApiLogsResponse {
  @ApiProperty({ description: 'API 로그 목록', type: [ApiLogItemResponse] })
  logs: ApiLogItemResponse[];

  @ApiProperty({ description: '페이지네이션 메타 정보', type: ApiLogPaginationMeta })
  meta: ApiLogPaginationMeta;
}
