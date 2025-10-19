import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckItemResponse {
  @ApiProperty({ description: 'Health Check ID', example: 12345 })
  id: number;

  @ApiProperty({ description: '세션 ID', example: 'uuid-string' })
  sessionId: string;

  @ApiProperty({ description: '페이지 타입', example: 'USER', nullable: true })
  pageType: string | null;

  @ApiProperty({ description: '페이지 URL', example: 'https://example.com/apply', nullable: true })
  pageUrl: string | null;

  @ApiProperty({ description: '페이지 제목', example: '원서 접수', nullable: true })
  pageTitle: string | null;

  @ApiProperty({ description: 'DOM 로드 시간 (ms)', example: 500, nullable: true })
  domLoadTime: number | null;

  @ApiProperty({ description: '페이지 로드 시간 (ms)', example: 1200, nullable: true })
  pageLoadTime: number | null;

  @ApiProperty({ description: '메모리 사용량 (MB)', example: 150.5, nullable: true })
  memoryUsage: number | null;

  @ApiProperty({ description: '연결 타입', example: '4g', nullable: true })
  connectionType: string | null;

  @ApiProperty({ description: '생성 시간', example: '2025-01-15T10:30:00Z' })
  createdAt: Date;
}

export class HealthCheckPaginationMeta {
  @ApiProperty({ description: '현재 페이지', example: 1 })
  currentPage: number;

  @ApiProperty({ description: '페이지 크기', example: 20 })
  pageSize: number;

  @ApiProperty({ description: '전체 항목 수', example: 150 })
  totalItems: number;

  @ApiProperty({ description: '전체 페이지 수', example: 8 })
  totalPages: number;
}

export class GetHealthChecksResponse {
  @ApiProperty({ description: 'Health Check 목록', type: [HealthCheckItemResponse] })
  healthChecks: HealthCheckItemResponse[];

  @ApiProperty({ description: '페이지네이션 메타 정보', type: HealthCheckPaginationMeta })
  meta: HealthCheckPaginationMeta;
}
