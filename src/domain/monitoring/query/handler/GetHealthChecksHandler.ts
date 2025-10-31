import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { GetHealthChecksQuery } from '../GetHealthChecksQuery';
import { HealthCheck } from '../../entity/HealthCheck.entity';
import { GetHealthChecksResponse, HealthCheckItemResponse, HealthCheckPaginationMeta } from '../../presentation/dto/response/GetHealthChecksResponse';

@QueryHandler(GetHealthChecksQuery)
export class GetHealthChecksHandler implements IQueryHandler<GetHealthChecksQuery> {
  constructor(
    @InjectRepository(HealthCheck)
    private readonly healthCheckRepository: Repository<HealthCheck>,
  ) {}

  async execute(query: GetHealthChecksQuery): Promise<GetHealthChecksResponse> {
    const { page, limit, sessionId, pageType, startDate, endDate } = query.request;

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
