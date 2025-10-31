import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetErrorsQuery } from '../query/GetErrorsQuery';
import { GetErrorsRequest } from '../presentation/dto/request/GetErrorsRequest';
import { GetErrorsResponse } from '../presentation/dto/response/GetErrorsResponse';

@Injectable()
export class ErrorQueryService {
  constructor(private readonly queryBus: QueryBus) {}

  async getErrors(request: GetErrorsRequest): Promise<GetErrorsResponse> {
    return this.queryBus.execute(new GetErrorsQuery(request));
  }
}
