import { GetHealthChecksRequest } from '../presentation/dto/request/GetHealthChecksRequest';

export class GetHealthChecksQuery {
  constructor(public readonly request: GetHealthChecksRequest) {}
}
