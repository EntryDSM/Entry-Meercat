import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { GetApiLogsQuery } from '../GetApiLogsQuery';
import { ApiLog } from '../../entity/ApiLog.entity';
import { GetApiLogsResponse, ApiLogItemResponse, ApiLogPaginationMeta } from '../../presentation/dto/response/GetApiLogsResponse';

@QueryHandler(GetApiLogsQuery)
export class GetApiLogsHandler implements IQueryHandler<GetApiLogsQuery> {
  constructor(
    @InjectRepository(ApiLog)
    private readonly apiLogRepository: Repository<ApiLog>,
  ) {}

  async execute(query: GetApiLogsQuery): Promise<GetApiLogsResponse> {
    const { page, limit, sessionId, endpoint, startDate, endDate } = query.request;

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
