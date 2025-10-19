import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { HealthCheck } from '../entity/HealthCheck.entity';
import { ApiLog } from '../entity/ApiLog.entity';
import { Session } from '../../session/entity/Session.entity';
import { HealthCheckRequest } from '../presentation/dto/request/HealthCheckRequest';
import { ApiLogRequest } from '../presentation/dto/request/ApiLogRequest';
import { GetApiLogsRequest } from '../presentation/dto/request/GetApiLogsRequest';
import { GetHealthChecksRequest } from '../presentation/dto/request/GetHealthChecksRequest';
import { GetApiLogsResponse, ApiLogItemResponse, ApiLogPaginationMeta } from '../presentation/dto/response/GetApiLogsResponse';
import { GetHealthChecksResponse, HealthCheckItemResponse, HealthCheckPaginationMeta } from '../presentation/dto/response/GetHealthChecksResponse';

/**
 * 모니터링 서비스
 *
 * @description
 * - Health check 기록
 * - API 로그 기록
 * - 세션 heartbeat 업데이트
 */
@Injectable()
export class MonitoringService {
  constructor(
    @InjectRepository(HealthCheck)
    private readonly healthCheckRepository: Repository<HealthCheck>,
    @InjectRepository(ApiLog)
    private readonly apiLogRepository: Repository<ApiLog>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  /**
   * Health check 기록 및 세션 heartbeat 업데이트
   *
   * @param request - Health check 요청
   */
  async recordHealthCheck(request: HealthCheckRequest): Promise<void> {
    const healthCheck = HealthCheck.create(
      request.sessionId,
      request.pageType,
      request.page.url,
      request.page.title,
      request.page.domLoadTime,
      request.page.pageLoadTime,
      request.performance.memoryUsage,
      request.performance.connectionType,
    );

    await this.healthCheckRepository.save(healthCheck);

    await this.sessionRepository.update(
      { id: request.sessionId },
      {
        lastHeartbeatAt: new Date(),
        currentPageType: request.pageType,
      },
    );
  }

  /**
   * API 로그 기록
   *
   * @param request - API 로그 요청
   */
  async recordApiLog(request: ApiLogRequest): Promise<void> {
    const apiLog = ApiLog.create(
      request.sessionId,
      request.endpoint,
      request.method,
      request.statusCode,
      request.responseTime,
      request.requestSize,
      request.responseSize,
    );

    await this.apiLogRepository.save(apiLog);
  }

  /**
   * API 로그 목록 조회
   *
   * @description
   * - 세션 ID, 엔드포인트 필터링
   * - 날짜 범위 필터링
   * - 페이지네이션 지원
   *
   * @param request - API 로그 조회 요청
   * @returns Promise<GetApiLogsResponse> API 로그 목록 및 페이지네이션 정보
   */
  async getApiLogs(request: GetApiLogsRequest): Promise<GetApiLogsResponse> {
    const { page, limit, sessionId, endpoint, startDate, endDate } = request;

    const where: any = {};

    if (sessionId) {
      where.sessionId = sessionId;
    }

    if (endpoint) {
      where.endpoint = endpoint;
    }

    if (startDate || endDate) {
      where.createdAt = this.buildDateFilter(startDate, endDate);
    }

    const [logs, totalItems] = await this.apiLogRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const mappedLogs: ApiLogItemResponse[] = logs.map((log) => ({
      id: log.id,
      sessionId: log.sessionId,
      endpoint: log.endpoint,
      method: log.method,
      statusCode: log.statusCode,
      responseTime: log.responseTime,
      requestSize: log.requestSize,
      responseSize: log.responseSize,
      createdAt: log.createdAt,
    }));

    const totalPages = Math.ceil(totalItems / limit);
    const meta: ApiLogPaginationMeta = {
      currentPage: page,
      pageSize: limit,
      totalItems,
      totalPages,
    };

    return { logs: mappedLogs, meta };
  }

  /**
   * Health Check 목록 조회
   *
   * @description
   * - 세션 ID, 페이지 타입 필터링
   * - 날짜 범위 필터링
   * - 페이지네이션 지원
   *
   * @param request - Health Check 조회 요청
   * @returns Promise<GetHealthChecksResponse> Health Check 목록 및 페이지네이션 정보
   */
  async getHealthChecks(request: GetHealthChecksRequest): Promise<GetHealthChecksResponse> {
    const { page, limit, sessionId, pageType, startDate, endDate } = request;

    const where: any = {};

    if (sessionId) {
      where.sessionId = sessionId;
    }

    if (pageType) {
      where.pageType = pageType;
    }

    if (startDate || endDate) {
      where.createdAt = this.buildDateFilter(startDate, endDate);
    }

    const [healthChecks, totalItems] = await this.healthCheckRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const mappedHealthChecks: HealthCheckItemResponse[] = healthChecks.map((hc) => ({
      id: hc.id,
      sessionId: hc.sessionId,
      pageType: hc.pageType,
      pageUrl: hc.pageUrl,
      pageTitle: hc.pageTitle,
      domLoadTime: hc.domLoadTime,
      pageLoadTime: hc.pageLoadTime,
      memoryUsage: hc.memoryUsage,
      connectionType: hc.connectionType,
      createdAt: hc.createdAt,
    }));

    const totalPages = Math.ceil(totalItems / limit);
    const meta: HealthCheckPaginationMeta = {
      currentPage: page,
      pageSize: limit,
      totalItems,
      totalPages,
    };

    return { healthChecks: mappedHealthChecks, meta };
  }

  /**
   * 날짜 필터 생성
   */
  private buildDateFilter(startDate?: string, endDate?: string): any {
    if (startDate && endDate) {
      return Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      return MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      return LessThanOrEqual(new Date(endDate));
    }
    return undefined;
  }
}
