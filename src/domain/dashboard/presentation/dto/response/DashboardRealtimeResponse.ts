import { ApiProperty } from '@nestjs/swagger';

export class ConcurrentStatusDto {
  @ApiProperty()
  browsing: number;

  @ApiProperty()
  authenticated: number;
}

export class ConcurrentPageTypeDto {
  @ApiProperty()
  USER: number;

  @ApiProperty()
  AUTH: number;

  @ApiProperty()
  ADMISSION: number;
}

export class RealtimeDto {
  @ApiProperty()
  concurrent: {
    total: number;
    byStatus: ConcurrentStatusDto;
    byPageType: ConcurrentPageTypeDto;
  };

  @ApiProperty()
  activeSubmissions: number;
}

export class PerformanceDto {
  @ApiProperty()
  server: {
    avgResponseTime: number;
    maxResponseTime: number;
  };

  @ApiProperty()
  client: {
    avgDomLoadTime: number;
  };
}

export class ApiStatusDto {
  @ApiProperty({ description: '전체 API 요청 수' })
  totalRequests: number;

  @ApiProperty({ description: '최근 6시간 API 요청 수' })
  requestsLastHour: number;

  @ApiProperty({ description: '최근 6시간 성공 요청 수 (200-299)' })
  successRequests: number;

  @ApiProperty({ description: '최근 6시간 실패 요청 수' })
  errorRequests: number;

  @ApiProperty({ description: '평균 응답 시간 (ms)' })
  avgResponseTime: number;

  @ApiProperty({ description: '최대 응답 시간 (ms)' })
  maxResponseTime: number;
}

export class ErrorsDto {
  @ApiProperty()
  lastHour: {
    client: number;
    clientWarnings: number;
    server: number;
    critical: number;
  };

  @ApiProperty()
  recentServerErrors: any[];

  @ApiProperty()
  recentClientErrors: any[];

  @ApiProperty()
  recentClientWarnings: any[];
}

export class SubmissionsDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  inProgress: number;

  @ApiProperty()
  success: number;

  @ApiProperty()
  failed: number;

  @ApiProperty()
  abandoned: number;

  @ApiProperty()
  avgDuration: string;
}

export class CancellationsDto {
  @ApiProperty()
  success: number;

  @ApiProperty()
  failed: number;
}

export class PdfDto {
  @ApiProperty()
  download: {
    success: number;
    failed: number;
  };

  @ApiProperty()
  preview: {
    success: number;
    failed: number;
  };
}

export class ApiDto {
  @ApiProperty()
  totalRequests: number;
}

export class NetworkDto {
  @ApiProperty()
  good: number;

  @ApiProperty()
  poor: number;
}

export class DeviceDto {
  @ApiProperty()
  count: number;

  @ApiProperty()
  percentage: number;
}

export class TimelineDataDto {
  @ApiProperty()
  time: string;

  @ApiProperty()
  count: number;
}

export class TimelineDto {
  @ApiProperty()
  concurrentMax: number;

  @ApiProperty()
  concurrentAvg: number;

  @ApiProperty({ type: [TimelineDataDto] })
  data: TimelineDataDto[];
}

export class ServerTimeoutDto {
  @ApiProperty()
  lastHour: number;

  @ApiProperty()
  total: number;
}

export class VisitorStatsDto {
  @ApiProperty({ description: '전체 세션 수' })
  totalSessions: number;

  @ApiProperty({ description: '재방문 세션 수 (1회 이상 재활용)' })
  revisitSessions: number;

  @ApiProperty({ description: '재방문율 (%)' })
  revisitRate: number;

  @ApiProperty({ description: '평균 재방문 횟수' })
  avgRevisitCount: number;

  @ApiProperty({ description: '최근 6시간 세션 평균 체류시간' })
  avgStayTime: string;
}

export class ConcurrentLastHourDto {
  @ApiProperty({ description: '최근 6시간 최대 동시접속자 수' })
  max: number;

  @ApiProperty({ description: '최근 6시간 평균 동시접속자 수' })
  avg: number;
}

export class DashboardRealtimeResponse {
  @ApiProperty({ type: RealtimeDto })
  realtime: RealtimeDto;

  @ApiProperty({ type: PerformanceDto })
  performance: PerformanceDto;

  @ApiProperty({ type: ApiStatusDto })
  apiStatus: ApiStatusDto;

  @ApiProperty({ type: ErrorsDto })
  errors: ErrorsDto;

  @ApiProperty({ type: SubmissionsDto })
  submissions: SubmissionsDto;

  @ApiProperty({ type: CancellationsDto })
  cancellations: CancellationsDto;

  @ApiProperty({ type: PdfDto })
  pdf: PdfDto;

  @ApiProperty({ type: ApiDto })
  api: ApiDto;

  @ApiProperty({ type: NetworkDto })
  network: NetworkDto;

  @ApiProperty()
  devices: Record<string, DeviceDto>;

  @ApiProperty({ type: TimelineDto })
  timeline: TimelineDto;

  @ApiProperty({ type: ServerTimeoutDto })
  serverTimeout: ServerTimeoutDto;

  @ApiProperty({ type: VisitorStatsDto })
  visitorStats: VisitorStatsDto;

  @ApiProperty({ type: ConcurrentLastHourDto })
  concurrentLastHour: ConcurrentLastHourDto;
}
