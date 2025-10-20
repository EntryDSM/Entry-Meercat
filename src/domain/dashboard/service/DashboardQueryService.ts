import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Between, IsNull, Not, MoreThanOrEqual, LessThan, Like, In, Or } from 'typeorm';
import { Session, UserStatus } from '../../session/entity/Session.entity';
import { HealthCheck } from '../../monitoring/entity/HealthCheck.entity';
import { ApiLog } from '../../monitoring/entity/ApiLog.entity';
import { SubmissionSession, SubmissionStatus } from '../../submission/entity/SubmissionSession.entity';
import { SubmissionCancellation, CancelStatus } from '../../submission/entity/SubmissionCancellation.entity';
import { SubmissionEvent, SubmissionEventType } from '../../submission/entity/SubmissionEvent.entity';
import { ClientError } from '../../error/entity/ClientError.entity';
import { ServerError } from '../../error/entity/ServerError.entity';
import { CriticalError } from '../../error/entity/CriticalError.entity';
import { PdfOperation, PdfOperationType, PdfOperationStatus } from '../../pdf/entity/PdfOperation.entity';
import { NetworkTest, NetworkQualityRating } from '../../network/entity/NetworkTest.entity';
import { DashboardRealtimeResponse } from '../presentation/dto/response/DashboardRealtimeResponse';

/**
 * 대시보드 쿼리 서비스 (CQRS Query)
 *
 * @description
 * - 읽기 전용 쿼리 서비스
 * - 모든 도메인 데이터 집계
 * - 실시간 대시보드 데이터 제공
 */
@Injectable()
export class DashboardQueryService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(HealthCheck)
    private readonly healthCheckRepository: Repository<HealthCheck>,
    @InjectRepository(ApiLog)
    private readonly apiLogRepository: Repository<ApiLog>,
    @InjectRepository(SubmissionSession)
    private readonly submissionRepository: Repository<SubmissionSession>,
    @InjectRepository(SubmissionCancellation)
    private readonly cancellationRepository: Repository<SubmissionCancellation>,
    @InjectRepository(SubmissionEvent)
    private readonly submissionEventRepository: Repository<SubmissionEvent>,
    @InjectRepository(ClientError)
    private readonly clientErrorRepository: Repository<ClientError>,
    @InjectRepository(ServerError)
    private readonly serverErrorRepository: Repository<ServerError>,
    @InjectRepository(CriticalError)
    private readonly criticalErrorRepository: Repository<CriticalError>,
    @InjectRepository(PdfOperation)
    private readonly pdfOperationRepository: Repository<PdfOperation>,
    @InjectRepository(NetworkTest)
    private readonly networkTestRepository: Repository<NetworkTest>,
  ) {}

  /**
   * 실시간 대시보드 데이터 조회
   *
   * @returns Promise<DashboardRealtimeResponse> 대시보드 데이터
   */
  async getRealtimeData(): Promise<DashboardRealtimeResponse> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const activeSessions = await this.sessionRepository
      .createQueryBuilder('session')
      .where('session.ended_at IS NULL')
      .andWhere('session.last_heartbeat_at > :twoMinutesAgo', {
        twoMinutesAgo: new Date(now.getTime() - 2 * 60 * 1000),
      })
      .getMany();

    const totalConcurrent = activeSessions.length;

    const byStatus = {
      browsing: activeSessions.filter((s) => s.userStatus === UserStatus.BROWSING).length,
      authenticated: activeSessions.filter((s) => s.userStatus === UserStatus.AUTHENTICATED).length,
    };

    const byPageType = {
      USER: activeSessions.filter((s) => s.currentPageType === 'USER').length,
      AUTH: activeSessions.filter((s) => s.currentPageType === 'AUTH').length,
      ADMISSION: activeSessions.filter((s) => s.currentPageType === 'ADMISSION').length,
    };

    const activeSubmissions = await this.submissionRepository.count({
      where: { submissionStatus: SubmissionStatus.IN_PROGRESS },
    });

    const apiLogsLastHour = await this.apiLogRepository.find({
      where: { createdAt: MoreThan(oneHourAgo) },
    });

    const avgResponseTime =
      apiLogsLastHour.length > 0
        ? Math.round(
            apiLogsLastHour.reduce((sum, log) => sum + (log.responseTime || 0), 0) /
              apiLogsLastHour.length,
          )
        : 0;

    const maxResponseTime =
      apiLogsLastHour.length > 0
        ? Math.max(...apiLogsLastHour.map((log) => log.responseTime || 0))
        : 0;

    // Session 테이블에서 DOM 로드 시간 조회 (최근 6시간 내 시작된 세션)
    const sessionsLastHour = await this.sessionRepository.find({
      where: {
        startedAt: MoreThan(oneHourAgo),
        domLoadTime: Not(IsNull()),
      },
    });

    console.log('[DEBUG] sessionsLastHour.length:', sessionsLastHour.length);
    if (sessionsLastHour.length > 0) {
      console.log('[DEBUG] 첫 번째 세션 domLoadTime:', sessionsLastHour[0].domLoadTime);
      console.log('[DEBUG] 모든 domLoadTime:', sessionsLastHour.map(s => s.domLoadTime));
    }

    const avgDomLoadTime =
      sessionsLastHour.length > 0
        ? Math.round(
            sessionsLastHour.reduce((sum, session) => sum + (session.domLoadTime || 0), 0) /
              sessionsLastHour.length,
          )
        : 0;

    console.log('[DEBUG] avgDomLoadTime 계산 결과:', avgDomLoadTime);

    const totalSubmissions = await this.submissionRepository.count();
    const inProgress = await this.submissionRepository.count({
      where: { submissionStatus: SubmissionStatus.IN_PROGRESS },
    });
    const success = await this.submissionRepository.count({
      where: { submissionStatus: SubmissionStatus.SUCCESS },
    });
    const failed = await this.submissionRepository.count({
      where: { submissionStatus: SubmissionStatus.FAILED },
    });
    const abandoned = await this.submissionRepository.count({
      where: { submissionStatus: SubmissionStatus.ABANDONED },
    });

    const successCancellations = await this.cancellationRepository.count({
      where: { cancelStatus: CancelStatus.SUCCESS },
    });
    const failedCancellations = await this.cancellationRepository.count({
      where: { cancelStatus: CancelStatus.FAILED },
    });

    const totalApiRequests = await this.apiLogRepository.count();
    const apiRequestsLastHour = await this.apiLogRepository.count({
      where: { createdAt: MoreThan(oneHourAgo) },
    });

    // API 성공/실패 통계
    const apiSuccessCount = await this.apiLogRepository.count({
      where: {
        createdAt: MoreThan(oneHourAgo),
        statusCode: Between(200, 299),
      },
    });
    const apiErrorCount = apiRequestsLastHour - apiSuccessCount;

    // 재방문율 계산
    const totalSessions = await this.sessionRepository.count();
    const revisitSessions = await this.sessionRepository.count({
      where: { reuseCount: MoreThan(0) },
    });
    const revisitRate = totalSessions > 0
      ? Math.round((revisitSessions / totalSessions) * 100)
      : 0;

    const allSessions = await this.sessionRepository.find({
      select: ['reuseCount'],
    });
    const totalReuseCount = allSessions.reduce((sum, session) => sum + session.reuseCount, 0);
    const avgRevisitCount = revisitSessions > 0
      ? Math.round((totalReuseCount / revisitSessions) * 10) / 10
      : 0;

    // 최근 6시간 세션들의 평균 체류시간 계산
    const sessionsForStayTime = await this.sessionRepository.find({
      where: { startedAt: MoreThan(oneHourAgo) },
      select: ['startedAt', 'endedAt', 'lastHeartbeatAt'],
    });

    let avgStayTime = '0분 0초';
    if (sessionsForStayTime.length > 0) {
      const totalStayTimeMs = sessionsForStayTime.reduce((sum, session) => {
        const endTime = session.endedAt || session.lastHeartbeatAt;
        const stayTime = endTime.getTime() - session.startedAt.getTime();
        return sum + stayTime;
      }, 0);
      const avgStayTimeMs = totalStayTimeMs / sessionsForStayTime.length;
      const minutes = Math.floor(avgStayTimeMs / (1000 * 60));
      const seconds = Math.floor((avgStayTimeMs % (1000 * 60)) / 1000);
      avgStayTime = `${minutes}분 ${seconds}초`;
    }

    const devices: Record<string, { count: number; percentage: number }> = {};
    const deviceCounts = activeSessions.reduce(
      (acc, session) => {
        const os = session.osType || 'Unknown';
        acc[os] = (acc[os] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    Object.entries(deviceCounts).forEach(([os, count]) => {
      devices[os] = {
        count,
        percentage: Math.round((count / totalConcurrent) * 100),
      };
    });

    // 에러 통계 (최근 6시간)
    const clientErrorsLastHour = await this.clientErrorRepository.count({
      where: { createdAt: MoreThan(oneHourAgo) },
    });
    const serverErrorsLastHour = await this.serverErrorRepository.count({
      where: { createdAt: MoreThan(oneHourAgo) },
    });
    const criticalErrorsLastHour = await this.criticalErrorRepository.count({
      where: { createdAt: MoreThan(oneHourAgo) },
    });

    // 최근 에러 목록
    const recentServerErrors = await this.serverErrorRepository.find({
      order: { createdAt: 'DESC' },
      take: 10,
    });
    const recentClientErrors = await this.clientErrorRepository.find({
      order: { createdAt: 'DESC' },
      take: 10,
    });

    // PDF 통계
    const pdfDownloadSuccess = await this.pdfOperationRepository.count({
      where: {
        operationType: PdfOperationType.DOWNLOAD,
        operationStatus: PdfOperationStatus.SUCCESS,
      },
    });
    const pdfDownloadFailed = await this.pdfOperationRepository.count({
      where: {
        operationType: PdfOperationType.DOWNLOAD,
        operationStatus: PdfOperationStatus.FAILED,
      },
    });
    const pdfPreviewSuccess = await this.pdfOperationRepository.count({
      where: {
        operationType: PdfOperationType.PREVIEW,
        operationStatus: PdfOperationStatus.SUCCESS,
      },
    });
    const pdfPreviewFailed = await this.pdfOperationRepository.count({
      where: {
        operationType: PdfOperationType.PREVIEW,
        operationStatus: PdfOperationStatus.FAILED,
      },
    });

    // 네트워크 품질 통계 (최근 6시간, downloadSpeed >= 1 Mbps = GOOD)
    const networkGood = await this.networkTestRepository.count({
      where: {
        createdAt: MoreThan(oneHourAgo),
        downloadSpeed: MoreThanOrEqual(1),
      },
    });
    const networkPoor = await this.networkTestRepository.count({
      where: {
        createdAt: MoreThan(oneHourAgo),
        downloadSpeed: LessThan(1),
      },
    });

    // 제출 평균 소요 시간 계산
    const completedSubmissions = await this.submissionRepository.find({
      where: { submissionStatus: SubmissionStatus.SUCCESS },
      select: ['startedAt', 'completedAt'],
    });

    let avgDuration = '0시간 0분 0초';
    if (completedSubmissions.length > 0) {
      const totalDurationMs = completedSubmissions.reduce((sum, submission) => {
        if (submission.startedAt && submission.completedAt) {
          return sum + (submission.completedAt.getTime() - submission.startedAt.getTime());
        }
        return sum;
      }, 0);
      const avgDurationMs = totalDurationMs / completedSubmissions.length;
      const hours = Math.floor(avgDurationMs / (1000 * 60 * 60));
      const minutes = Math.floor((avgDurationMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((avgDurationMs % (1000 * 60)) / 1000);
      avgDuration = `${hours}시간 ${minutes}분 ${seconds}초`;
    }

    // 24시간 타임라인 데이터 (매 시간별 세션 수)
    const timelineData = await this.build24HourTimeline(twentyFourHoursAgo, now);
    const concurrentMax = Math.max(...timelineData.map(d => d.count), totalConcurrent);
    const concurrentAvg = Math.round(
      timelineData.reduce((sum, d) => sum + d.count, 0) / timelineData.length,
    );

    // 최근 6시간 동시접속 Max/Avg 계산
    const concurrentLastHourStats = await this.calculateLastHourConcurrent(oneHourAgo, now);

    // 원서 제출 이벤트 통계 (최근 6시간 및 전체)
    const submissionSuccessLastHour = await this.submissionEventRepository.count({
      where: {
        eventType: SubmissionEventType.SUBMISSION_SUCCESS,
        createdAt: MoreThan(oneHourAgo),
      },
    });
    const submissionCancelledLastHour = await this.submissionEventRepository.count({
      where: {
        eventType: SubmissionEventType.SUBMISSION_CANCEL,
        createdAt: MoreThan(oneHourAgo),
      },
    });
    const submissionSuccessTotal = await this.submissionEventRepository.count({
      where: { eventType: SubmissionEventType.SUBMISSION_SUCCESS },
    });
    const submissionCancelledTotal = await this.submissionEventRepository.count({
      where: { eventType: SubmissionEventType.SUBMISSION_CANCEL },
    });

    // 서버 타임아웃 집계
    // 타임아웃 조건: HTTP 408/504 또는 errorCategory/errorCode/message에 'timeout' 포함
    const serverTimeoutLastHour = await this.serverErrorRepository
      .createQueryBuilder('error')
      .where('error.created_at > :oneHourAgo', { oneHourAgo })
      .andWhere(
        '(error.http_status IN (:...timeoutStatuses) OR ' +
        'LOWER(error.error_category) LIKE :timeoutPattern OR ' +
        'LOWER(error.error_code) LIKE :timeoutPattern OR ' +
        'LOWER(error.message) LIKE :timeoutPattern)',
        {
          timeoutStatuses: [408, 504],
          timeoutPattern: '%timeout%',
        }
      )
      .getCount();

    const serverTimeoutTotal = await this.serverErrorRepository
      .createQueryBuilder('error')
      .where(
        '(error.http_status IN (:...timeoutStatuses) OR ' +
        'LOWER(error.error_category) LIKE :timeoutPattern OR ' +
        'LOWER(error.error_code) LIKE :timeoutPattern OR ' +
        'LOWER(error.message) LIKE :timeoutPattern)',
        {
          timeoutStatuses: [408, 504],
          timeoutPattern: '%timeout%',
        }
      )
      .getCount();

    return {
      realtime: {
        concurrent: {
          total: totalConcurrent,
          byStatus,
          byPageType,
        },
        activeSubmissions,
      },
      performance: {
        server: {
          avgResponseTime,
          maxResponseTime,
        },
        client: {
          avgDomLoadTime,
        },
      },
      apiStatus: {
        totalRequests: totalApiRequests,
        requestsLastHour: apiRequestsLastHour,
        successRequests: apiSuccessCount,
        errorRequests: apiErrorCount,
        avgResponseTime,
        maxResponseTime,
      },
      errors: {
        lastHour: {
          client: clientErrorsLastHour,
          clientWarnings: 0,
          server: serverErrorsLastHour,
          critical: criticalErrorsLastHour,
        },
        recentServerErrors: recentServerErrors.map(error => ({
          id: error.id,
          message: error.message,
          endpoint: error.endpoint,
          httpStatus: error.httpStatus,
          createdAt: error.createdAt,
        })),
        recentClientErrors: recentClientErrors.map(error => ({
          id: error.id,
          message: error.message,
          pageUrl: error.pageUrl,
          errorCategory: error.errorCategory,
          createdAt: error.createdAt,
        })),
        recentClientWarnings: [],
      },
      submissions: {
        total: totalSubmissions,
        inProgress,
        success,
        failed,
        abandoned,
        avgDuration,
      },
      cancellations: {
        success: successCancellations,
        failed: failedCancellations,
      },
      pdf: {
        download: {
          success: pdfDownloadSuccess,
          failed: pdfDownloadFailed,
        },
        preview: {
          success: pdfPreviewSuccess,
          failed: pdfPreviewFailed,
        },
      },
      api: {
        totalRequests: totalApiRequests,
      },
      network: {
        good: networkGood,
        poor: networkPoor,
      },
      devices,
      timeline: {
        concurrentMax,
        concurrentAvg,
        data: timelineData,
      },
      serverTimeout: {
        lastHour: serverTimeoutLastHour,
        total: serverTimeoutTotal,
      },
      visitorStats: {
        totalSessions,
        revisitSessions,
        revisitRate,
        avgRevisitCount,
        avgStayTime,
      },
      concurrentLastHour: concurrentLastHourStats,
      submissionEvents: {
        lastHour: {
          success: submissionSuccessLastHour,
          cancelled: submissionCancelledLastHour,
        },
        total: {
          success: submissionSuccessTotal,
          cancelled: submissionCancelledTotal,
        },
      },
    };
  }

  /**
   * 최근 6시간 동시접속 Max/Avg 계산
   *
   * @description
   * - 최근 6시간 동안 매 분마다 동시접속자 수 계산
   * - Max: 최댓값, Avg: 평균값
   *
   * @param oneHourAgo - 6시간 전 시간
   * @param now - 현재 시간
   * @returns Promise<{ max: number; avg: number }>
   */
  private async calculateLastHourConcurrent(
    oneHourAgo: Date,
    now: Date,
  ): Promise<{ max: number; avg: number }> {
    const concurrentCounts: number[] = [];

    // 최근 6시간을 5분 간격으로 샘플링 (72개 샘플)
    // 매 분마다 하면 360번 쿼리라 부하가 있으니 5분 간격으로 최적화
    const intervalMinutes = 5;
    const sampleCount = 360 / intervalMinutes;

    for (let i = 0; i < sampleCount; i++) {
      const checkTime = new Date(oneHourAgo.getTime() + i * intervalMinutes * 60 * 1000);
      const twoMinutesBefore = new Date(checkTime.getTime() - 2 * 60 * 1000);

      // 해당 시점의 동시접속자 수 = 시작했고, 아직 종료 안했고, 최근 2분 내 heartbeat가 있는 세션
      const count = await this.sessionRepository
        .createQueryBuilder('session')
        .where('session.started_at <= :checkTime', { checkTime })
        .andWhere('(session.ended_at IS NULL OR session.ended_at > :checkTime)', { checkTime })
        .andWhere('session.last_heartbeat_at > :twoMinutesBefore', { twoMinutesBefore })
        .getCount();

      concurrentCounts.push(count);
    }

    const max = concurrentCounts.length > 0 ? Math.max(...concurrentCounts) : 0;
    const avg = concurrentCounts.length > 0
      ? Math.round(concurrentCounts.reduce((sum, count) => sum + count, 0) / concurrentCounts.length)
      : 0;

    return { max, avg };
  }

  /**
   * 24시간 타임라인 데이터 생성
   *
   * @description
   * - 최근 24시간 동안 매 시간별 세션 수 집계
   * - 시작 세션 수를 기준으로 카운트
   *
   * @param startTime - 시작 시간 (24시간 전)
   * @param endTime - 종료 시간 (현재)
   * @returns Promise<TimelineDataDto[]> 24개 시간대별 데이터
   */
  private async build24HourTimeline(
    startTime: Date,
    endTime: Date,
  ): Promise<Array<{ time: string; count: number }>> {
    const timeline: Array<{ time: string; count: number }> = [];

    for (let i = 0; i < 24; i++) {
      const hourStart = new Date(startTime.getTime() + i * 60 * 60 * 1000);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

      const count = await this.sessionRepository.count({
        where: {
          startedAt: Between(hourStart, hourEnd),
        },
      });

      const hourLabel = String(hourStart.getHours()).padStart(2, '0');
      timeline.push({
        time: `${hourLabel}:00`,
        count,
      });
    }

    return timeline;
  }
}
