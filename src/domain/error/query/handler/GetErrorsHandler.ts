import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, FindOperator, FindOptionsWhere } from 'typeorm';
import { GetErrorsQuery } from '../GetErrorsQuery';
import { ClientError } from '../../entity/ClientError.entity';
import { ServerError } from '../../entity/ServerError.entity';
import { CriticalError } from '../../entity/CriticalError.entity';
import { GetErrorsResponse, ErrorItemResponse, PaginationMetaResponse } from '../../presentation/dto/response/GetErrorsResponse';
import { ErrorType, ErrorResolutionStatus } from '../../entity/ErrorType.enum';

@QueryHandler(GetErrorsQuery)
export class GetErrorsHandler implements IQueryHandler<GetErrorsQuery, GetErrorsResponse> {
  constructor(
    @InjectRepository(ClientError)
    private readonly clientErrorRepository: Repository<ClientError>,
    @InjectRepository(ServerError)
    private readonly serverErrorRepository: Repository<ServerError>,
    @InjectRepository(CriticalError)
    private readonly criticalErrorRepository: Repository<CriticalError>,
  ) {}

  async execute(query: GetErrorsQuery): Promise<GetErrorsResponse> {
    const { page, limit, errorType, resolutionStatus, startDate, endDate } = query.request;

    let errors: ErrorItemResponse[] = [];
    let totalItems = 0;

    const dateFilter = this.buildDateFilter(startDate, endDate);

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

    errors.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalPages = Math.ceil(totalItems / limit);
    const meta: PaginationMetaResponse = {
      currentPage: page,
      pageSize: limit,
      totalItems,
      totalPages,
    };

    return { errors, meta };
  }

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

  private async getCriticalErrors(
    page: number,
    limit: number,
    dateFilter: FindOperator<Date> | undefined,
    resolutionStatus?: ErrorResolutionStatus,
  ): Promise<[ErrorItemResponse[], number]> {
    const where: FindOptionsWhere<CriticalError> = { createdAt: dateFilter };

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
