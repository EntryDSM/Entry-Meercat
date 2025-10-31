import { GetErrorsRequest } from '../presentation/dto/request/GetErrorsRequest';

export class GetErrorsQuery {
  constructor(public readonly request: GetErrorsRequest) {}
}
