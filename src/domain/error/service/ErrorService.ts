import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, FindOperator, FindOptionsWhere } from 'typeorm';
import { ClientError } from '../entity/ClientError.entity';
import { ServerError } from '../entity/ServerError.entity';
import { CriticalError } from '../entity/CriticalError.entity';
import { ReportClientErrorRequest } from '../presentation/dto/request/ReportClientErrorRequest';
import { ReportServerErrorRequest } from '../presentation/dto/request/ReportServerErrorRequest';
import { ReportCriticalErrorRequest } from '../presentation/dto/request/ReportCriticalErrorRequest';
import { ErrorReportResponse } from '../presentation/dto/response/ErrorReportResponse';
import { GetErrorsRequest } from '../presentation/dto/request/GetErrorsRequest';
import { GetErrorsResponse, ErrorItemResponse, PaginationMetaResponse } from '../presentation/dto/response/GetErrorsResponse';
import { ErrorType, ErrorResolutionStatus } from '../entity/ErrorType.enum';
import { WebhookService } from '../../../global/services/WebhookService';

/**
 * 에러 서비스
 *
 * @description
 * - 클라이언트/서버/크리티컬 에러 로깅
 * - 에러 데이터 저장 및 조회
 */
@Injectable()
export class ErrorService {
  constructor(
    @InjectRepository(ClientError)
    private readonly clientErrorRepository: Repository<ClientError>,
    @InjectRepository(ServerError)
    private readonly serverErrorRepository: Repository<ServerError>,
    @InjectRepository(CriticalError)
    private readonly criticalErrorRepository: Repository<CriticalError>,
    private readonly webhookService: WebhookService,
  ) {}

  /**
   * 클라이언트 에러 리포트
   *
   * @param request - 클라이언트 에러 리포트 요청
   * @returns Promise<ErrorReportResponse> 에러 리포트 응답
   */
  async reportClientError(
    request: ReportClientErrorRequest,
  ): Promise<ErrorReportResponse> {
    const clientError = ClientError.create(
      request.sessionId || null,
      request.pageType || null,
      request.errorCategory || null,
      request.errorCode || null,
      request.message,
      request.stackTrace || null,
      request.pageUrl || null,
      request.componentName || null,
      request.userAction || null,
    );

    const savedError = await this.clientErrorRepository.save(clientError);

    // 웹훅 전송 (비동기, non-blocking)
    this.webhookService.sendClientErrorWebhook({
      errorId: savedError.id,
      errorType: 'CLIENT',
      sessionId: savedError.sessionId,
      pageType: savedError.pageType,
      errorCategory: savedError.errorCategory,
      errorCode: savedError.errorCode,
      message: savedError.message,
      stackTrace: savedError.stackTrace,
      pageUrl: savedError.pageUrl,
      componentName: savedError.componentName,
      userAction: savedError.userAction,
      timestamp: savedError.createdAt,
    }).catch(() => {});

    return {
      errorId: savedError.id,
      timestamp: Date.now(),
      status: 'LOGGED',
    };
  }

  /**
   * 서버 에러 리포트
   *
   * @param request - 서버 에러 리포트 요청
   * @returns Promise<ErrorReportResponse> 에러 리포트 응답
   */
  async reportServerError(
    request: ReportServerErrorRequest,
  ): Promise<ErrorReportResponse> {
    const serverError = ServerError.create(
      request.sessionId || null,
      request.pageType || null,
      request.endpoint || null,
      request.httpMethod || null,
      request.httpStatus || null,
      request.errorCategory || null,
      request.errorCode || null,
      request.message,
      request.stackTrace || null,
      request.requestPayload || null,
      request.responseTime || null,
    );

    const savedError = await this.serverErrorRepository.save(serverError);

    // 웹훅 전송 (비동기, non-blocking)
    this.webhookService.sendServerErrorWebhook({
      errorId: savedError.id,
      errorType: 'SERVER',
      sessionId: savedError.sessionId,
      pageType: savedError.pageType,
      endpoint: savedError.endpoint,
      httpMethod: savedError.httpMethod,
      httpStatus: savedError.httpStatus,
      errorCategory: savedError.errorCategory,
      errorCode: savedError.errorCode,
      message: savedError.message,
      stackTrace: savedError.stackTrace,
      requestPayload: savedError.requestPayload,
      responseTime: savedError.responseTime,
      timestamp: savedError.createdAt,
    }).catch(() => {});

    return {
      errorId: savedError.id,
      timestamp: Date.now(),
      status: 'LOGGED',
    };
  }

  /**
   * 크리티컬 에러 리포트
   *
   * @param request - 크리티컬 에러 리포트 요청
   * @returns Promise<ErrorReportResponse> 에러 리포트 응답
   */
  async reportCriticalError(
    request: ReportCriticalErrorRequest,
  ): Promise<ErrorReportResponse> {
    const criticalError = CriticalError.create(
      request.sessionId || null,
      request.pageType || null,
      request.errorCategory || null,
      request.errorCode || null,
      request.message,
      request.stackTrace || null,
      request.context || null,
      request.userImpact || null,
    );

    const savedError = await this.criticalErrorRepository.save(criticalError);

    return {
      errorId: savedError.id,
      timestamp: Date.now(),
      status: 'LOGGED',
    };
  }

  /**
   * 크리티컬 에러 해결 처리
   *
   * @param errorId - 에러 ID
   */
  async resolveCriticalError(errorId: number): Promise<void> {
    const error = await this.criticalErrorRepository.findOne({
      where: { id: errorId },
    });

    if (!error) {
      throw new NotFoundException('Critical error not found');
    }

    error.resolve();
    await this.criticalErrorRepository.save(error);
  }

  /**
   * 에러 목록 조회 (관리자용)
   *
   * @description
   * - 에러 타입별 필터링 (CLIENT, SERVER, CRITICAL)
   * - 날짜 범위 필터링
   * - 해결 상태 필터링 (CRITICAL만)
   * - 페이지네이션 지원
   *
   * @param request - 에러 조회 요청
   * @returns Promise<GetErrorsResponse> 에러 목록 및 페이지네이션 정보
   */
  async getErrors(request: GetErrorsRequest): Promise<GetErrorsResponse> {
    const { page, limit, errorType, resolutionStatus, startDate, endDate } = request;

    let errors: ErrorItemResponse[] = [];
    let totalItems = 0;

    // 날짜 필터 생성
    const dateFilter = this.buildDateFilter(startDate, endDate);

    // 에러 타입별 조회
    if (!errorType || errorType === ErrorType.CLIENT) {
      const [clientErrors, clientCount] = await this.getClientErrors(page, limit, dateFilter);
      if (errorType === ErrorType.CLIENT) {
        errors = clientErrors;
        totalItems = clientCount;
      } else {
        errors.push(...clientErrors);
        totalItems += clientCount;
      }
    }

    if (!errorType || errorType === ErrorType.SERVER) {
      const [serverErrors, serverCount] = await this.getServerErrors(page, limit, dateFilter);
      if (errorType === ErrorType.SERVER) {
        errors = serverErrors;
        totalItems = serverCount;
      } else if (!errorType) {
        errors.push(...serverErrors);
        totalItems += serverCount;
      }
    }

    if (!errorType || errorType === ErrorType.CRITICAL) {
      const [criticalErrors, criticalCount] = await this.getCriticalErrors(
        page,
        limit,
        dateFilter,
        resolutionStatus,
      );
      if (errorType === ErrorType.CRITICAL) {
        errors = criticalErrors;
        totalItems = criticalCount;
      } else if (!errorType) {
        errors.push(...criticalErrors);
        totalItems += criticalCount;
      }
    }

    // 날짜 기준 내림차순 정렬
    errors.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 페이지네이션 메타 정보
    const totalPages = Math.ceil(totalItems / limit);
    const meta: PaginationMetaResponse = {
      currentPage: page,
      pageSize: limit,
      totalItems,
      totalPages,
    };

    return { errors, meta };
  }

  /**
   * 클라이언트 에러 조회
   */
  private async getClientErrors(
    page: number,
    limit: number,
    dateFilter: FindOperator<Date> | undefined,
  ): Promise<[ErrorItemResponse[], number]> {
    const [clientErrors, count] = await this.clientErrorRepository.findAndCount({
      where: { createdAt: dateFilter },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const mapped = clientErrors.map((error) => ({
      id: error.id,
      errorType: ErrorType.CLIENT,
      sessionId: error.sessionId,
      pageType: error.pageType,
      errorCategory: error.errorCategory,
      errorCode: error.errorCode,
      message: error.message,
      createdAt: error.createdAt,
    }));

    return [mapped, count];
  }

  /**
   * 서버 에러 조회
   */
  private async getServerErrors(
    page: number,
    limit: number,
    dateFilter: FindOperator<Date> | undefined,
  ): Promise<[ErrorItemResponse[], number]> {
    const [serverErrors, count] = await this.serverErrorRepository.findAndCount({
      where: { createdAt: dateFilter },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const mapped = serverErrors.map((error) => ({
      id: error.id,
      errorType: ErrorType.SERVER,
      sessionId: error.sessionId,
      pageType: error.pageType,
      errorCategory: error.errorCategory,
      errorCode: error.errorCode,
      message: error.message,
      endpoint: error.endpoint,
      httpMethod: error.httpMethod,
      httpStatus: error.httpStatus,
      createdAt: error.createdAt,
    }));

    return [mapped, count];
  }

  /**
   * 크리티컬 에러 조회
   */
  private async getCriticalErrors(
    page: number,
    limit: number,
    dateFilter: FindOperator<Date> | undefined,
    resolutionStatus?: ErrorResolutionStatus,
  ): Promise<[ErrorItemResponse[], number]> {
    const where: FindOptionsWhere<CriticalError> = { createdAt: dateFilter };

    // 해결 상태 필터링
    if (resolutionStatus === ErrorResolutionStatus.RESOLVED) {
      where.resolved = true;
    } else if (resolutionStatus === ErrorResolutionStatus.UNRESOLVED) {
      where.resolved = false;
    }

    const [criticalErrors, count] = await this.criticalErrorRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const mapped = criticalErrors.map((error) => ({
      id: error.id,
      errorType: ErrorType.CRITICAL,
      sessionId: error.sessionId,
      pageType: error.pageType,
      errorCategory: error.errorCategory,
      errorCode: error.errorCode,
      message: error.message,
      createdAt: error.createdAt,
      resolved: error.resolved,
      resolvedAt: error.resolvedAt,
    }));

    return [mapped, count];
  }

  /**
   * 날짜 필터 생성
   */
  private buildDateFilter(startDate?: string, endDate?: string): FindOperator<Date> | undefined {
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
