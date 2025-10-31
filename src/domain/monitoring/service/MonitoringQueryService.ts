import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetApiLogsQuery } from '../query/GetApiLogsQuery';
import { GetHealthChecksQuery } from '../query/GetHealthChecksQuery';
import { GetApiLogsRequest } from '../presentation/dto/request/GetApiLogsRequest';
import { GetHealthChecksRequest } from '../presentation/dto/request/GetHealthChecksRequest';
import { GetApiLogsResponse } from '../presentation/dto/response/GetApiLogsResponse';
import { GetHealthChecksResponse } from '../presentation/dto/response/GetHealthChecksResponse';

@Injectable()
export class MonitoringQueryService {
  constructor(private readonly queryBus: QueryBus) {}

  async getApiLogs(request: GetApiLogsRequest): Promise<GetApiLogsResponse> {
    return this.queryBus.execute(new GetApiLogsQuery(request));
  }

  async getHealthChecks(request: GetHealthChecksRequest): Promise<GetHealthChecksResponse> {
    return this.queryBus.execute(new GetHealthChecksQuery(request));
  }
}
