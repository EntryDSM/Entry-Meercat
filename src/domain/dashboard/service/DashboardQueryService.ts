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
 * 대시보드 쿼리 서비스
 * - 읽기/쓰기 책임 분리 구조의 읽기 전용 서비스
 * - 10개 이상의 도메인 레포지토리에서 데이터를 집계하여 대시보드 통계 제공
 * - Command(쓰기)는 각 도메인 서비스(SessionService, ErrorService 등)가 담당
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
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 모든 독립 쿼리를 병렬로 실행
    const [
      activeSessions,
      activeSubmissions,
      apiLogsLastHour,
      sessionsLastHour,
      totalSubmissions,
      inProgress,
      success,
      failed,
      abandoned,
      successCancellations,
      failedCancellations,
      totalApiRequests,
      apiRequestsLastHour,
      apiSuccessCount,
      totalSessions,
      revisitSessions,
      reuseSumResult,
      sessionsForStayTime,
      clientErrorsLastHour,
      serverErrorsLastHour,
      criticalErrorsLastHour,
      recentServerErrors,
      recentClientErrors,
      pdfDownloadSuccess,
      pdfDownloadFailed,
      pdfPreviewSuccess,
      pdfPreviewFailed,
      networkGood,
      networkPoor,
      completedSubmissions,
      timelineData,
      concurrentLastHourStats,
      submissionSuccessLastHour,
      submissionCancelledLastHour,
      submissionSuccessTotal,
      submissionCancelledTotal,
      serverTimeoutLastHour,
      serverTimeoutTotal,
    ] = await Promise.all([
      // activeSessions
      this.sessionRepository
        .createQueryBuilder('session')
        .where('session.ended_at IS NULL')
        .andWhere('session.last_heartbeat_at > :twoMinutesAgo', {
          twoMinutesAgo: new Date(now.getTime() - 2 * 60 * 1000),
        })
        .getMany(),
      // activeSubmissions
      this.submissionRepository.count({
        where: { submissionStatus: SubmissionStatus.IN_PROGRESS },
      }),
      // apiLogsLastHour
      this.apiLogRepository.find({
        where: { createdAt: MoreThan(sixHoursAgo) },
      }),
      // sessionsLastHour (DOM 로드 시간)
      this.sessionRepository.find({
        where: {
          startedAt: MoreThan(sixHoursAgo),
          domLoadTime: Not(IsNull()),
        },
      }),
      // totalSubmissions
      this.submissionRepository.count(),
      // inProgress
      this.submissionRepository.count({
        where: { submissionStatus: SubmissionStatus.IN_PROGRESS },
      }),
      // success
      this.submissionRepository.count({
        where: { submissionStatus: SubmissionStatus.SUCCESS },
      }),
      // failed
      this.submissionRepository.count({
        where: { submissionStatus: SubmissionStatus.FAILED },
      }),
      // abandoned
      this.submissionRepository.count({
        where: { submissionStatus: SubmissionStatus.ABANDONED },
      }),
      // successCancellations
      this.cancellationRepository.count({
        where: { cancelStatus: CancelStatus.SUCCESS },
      }),
      // failedCancellations
      this.cancellationRepository.count({
        where: { cancelStatus: CancelStatus.FAILED },
      }),
      // totalApiRequests
      this.apiLogRepository.count(),
      // apiRequestsLastHour
      this.apiLogRepository.count({
        where: { createdAt: MoreThan(sixHoursAgo) },
      }),
      // apiSuccessCount
      this.apiLogRepository.count({
        where: {
          createdAt: MoreThan(sixHoursAgo),
          statusCode: Between(200, 299),
        },
      }),
      // totalSessions
      this.sessionRepository.count(),
      // revisitSessions
      this.sessionRepository.count({
        where: { reuseCount: MoreThan(0) },
      }),
      // reuseSumResult (SUM 쿼리)
      this.sessionRepository
        .createQueryBuilder('session')
        .select('SUM(session.reuseCount)', 'sum')
        .getRawOne(),
      // sessionsForStayTime
      this.sessionRepository.find({
        where: { startedAt: MoreThan(sixHoursAgo) },
        select: ['startedAt', 'endedAt', 'lastHeartbeatAt'],
      }),
      // clientErrorsLastHour
      this.clientErrorRepository.count({
        where: { createdAt: MoreThan(sixHoursAgo) },
      }),
      // serverErrorsLastHour
      this.serverErrorRepository.count({
        where: { createdAt: MoreThan(sixHoursAgo) },
      }),
      // criticalErrorsLastHour
      this.criticalErrorRepository.count({
        where: { createdAt: MoreThan(sixHoursAgo) },
      }),
      // recentServerErrors
      this.serverErrorRepository.find({
        order: { createdAt: 'DESC' },
        take: 10,
      }),
      // recentClientErrors
      this.clientErrorRepository.find({
        order: { createdAt: 'DESC' },
        take: 10,
      }),
      // pdfDownloadSuccess
      this.pdfOperationRepository.count({
        where: {
          operationType: PdfOperationType.DOWNLOAD,
          operationStatus: PdfOperationStatus.SUCCESS,
        },
      }),
      // pdfDownloadFailed
      this.pdfOperationRepository.count({
        where: {
          operationType: PdfOperationType.DOWNLOAD,
          operationStatus: PdfOperationStatus.FAILED,
        },
      }),
      // pdfPreviewSuccess
      this.pdfOperationRepository.count({
        where: {
          operationType: PdfOperationType.PREVIEW,
          operationStatus: PdfOperationStatus.SUCCESS,
        },
      }),
      // pdfPreviewFailed
      this.pdfOperationRepository.count({
        where: {
          operationType: PdfOperationType.PREVIEW,
          operationStatus: PdfOperationStatus.FAILED,
        },
      }),
      // networkGood
      this.networkTestRepository.count({
        where: {
          createdAt: MoreThan(sixHoursAgo),
          downloadSpeed: MoreThanOrEqual(1),
        },
      }),
      // networkPoor
      this.networkTestRepository.count({
        where: {
          createdAt: MoreThan(sixHoursAgo),
          downloadSpeed: LessThan(1),
        },
      }),
      // completedSubmissions
      this.submissionRepository.find({
        where: { submissionStatus: SubmissionStatus.SUCCESS },
        select: ['startedAt', 'completedAt'],
      }),
      // timelineData (24시간 타임라인)
      this.build24HourTimeline(twentyFourHoursAgo, now),
      // concurrentLastHourStats (6시간 동시접속 Max/Avg)
      this.calculateLastHourConcurrent(sixHoursAgo, now),
      // submissionSuccessLastHour
      this.submissionEventRepository.count({
        where: {
          eventType: SubmissionEventType.SUBMISSION_SUCCESS,
          createdAt: MoreThan(sixHoursAgo),
        },
      }),
      // submissionCancelledLastHour
      this.submissionEventRepository.count({
        where: {
          eventType: SubmissionEventType.SUBMISSION_CANCEL,
          createdAt: MoreThan(sixHoursAgo),
        },
      }),
      // submissionSuccessTotal
      this.submissionEventRepository.count({
        where: { eventType: SubmissionEventType.SUBMISSION_SUCCESS },
      }),
      // submissionCancelledTotal
      this.submissionEventRepository.count({
        where: { eventType: SubmissionEventType.SUBMISSION_CANCEL },
      }),
      // serverTimeoutLastHour
      this.serverErrorRepository
        .createQueryBuilder('error')
        .where('error.created_at > :sixHoursAgo', { sixHoursAgo })
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
        .getCount(),
      // serverTimeoutTotal
      this.serverErrorRepository
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
        .getCount(),
    ]);

    // 병렬 쿼리 결과를 기반으로 파생 값 계산
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

    const avgDomLoadTime =
      sessionsLastHour.length > 0
        ? Math.round(
            sessionsLastHour.reduce((sum, session) => sum + (session.domLoadTime || 0), 0) /
              sessionsLastHour.length,
          )
        : 0;

    const apiErrorCount = apiRequestsLastHour - apiSuccessCount;

    // 재방문율 계산
    const revisitRate = totalSessions > 0
      ? Math.round((revisitSessions / totalSessions) * 100)
      : 0;

    const totalReuseCount = Number(reuseSumResult?.sum) || 0;
    const avgRevisitCount = revisitSessions > 0
      ? Math.round((totalReuseCount / revisitSessions) * 10) / 10
      : 0;

    // 최근 6시간 세션들의 평균 체류시간 계산
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

    // 제출 평균 소요 시간 계산
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

    const concurrentMax = Math.max(...timelineData.map(d => d.count), totalConcurrent);
    const concurrentAvg = Math.round(
      timelineData.reduce((sum, d) => sum + d.count, 0) / timelineData.length,
    );

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
   * @param sixHoursAgo - 6시간 전 시간
   * @param now - 현재 시간
   * @returns Promise<{ max: number; avg: number }>
   */
  private async calculateLastHourConcurrent(
    sixHoursAgo: Date,
    now: Date,
  ): Promise<{ max: number; avg: number }> {
    // 최근 6시간을 5분 간격으로 샘플링 (72개 샘플)
    const intervalMinutes = 5;
    const sampleCount = 360 / intervalMinutes;

    // 단일 쿼리로 관련 세션을 모두 가져옴 (heartbeat 기준 2분 여유 포함)
    const twoMinutesBeforeStart = new Date(sixHoursAgo.getTime() - 2 * 60 * 1000);
    const sessions = await this.sessionRepository
      .createQueryBuilder('session')
      .select(['session.startedAt', 'session.endedAt', 'session.lastHeartbeatAt'])
      .where('session.started_at <= :now', { now })
      .andWhere('(session.ended_at IS NULL OR session.ended_at > :sixHoursAgo)', { sixHoursAgo })
      .andWhere('session.last_heartbeat_at > :twoMinutesBeforeStart', { twoMinutesBeforeStart })
      .getMany();

    // JS에서 각 샘플 포인트에 대해 동시접속자 수 계산
    const concurrentCounts: number[] = [];
    for (let i = 0; i < sampleCount; i++) {
      const checkTime = new Date(sixHoursAgo.getTime() + i * intervalMinutes * 60 * 1000);
      const twoMinutesBefore = new Date(checkTime.getTime() - 2 * 60 * 1000);

      const count = sessions.filter((s) => {
        const startedBefore = s.startedAt <= checkTime;
        const notEndedYet = !s.endedAt || s.endedAt > checkTime;
        const recentHeartbeat = s.lastHeartbeatAt > twoMinutesBefore;
        return startedBefore && notEndedYet && recentHeartbeat;
      }).length;

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
    // 단일 쿼리로 최근 24시간 세션을 모두 가져옴
    const sessions = await this.sessionRepository.find({
      where: {
        startedAt: Between(startTime, endTime),
      },
      select: ['startedAt'],
    });

    // JS에서 시간별로 groupBy 집계
    const timeline: Array<{ time: string; count: number }> = [];
    for (let i = 0; i < 24; i++) {
      const hourStart = new Date(startTime.getTime() + i * 60 * 60 * 1000);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

      const count = sessions.filter(
        (s) => s.startedAt >= hourStart && s.startedAt < hourEnd,
      ).length;

      const hourLabel = String(hourStart.getHours()).padStart(2, '0');
      timeline.push({
        time: `${hourLabel}:00`,
        count,
      });
    }

    return timeline;
  }
}
