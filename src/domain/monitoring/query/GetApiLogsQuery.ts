import { GetApiLogsRequest } from '../presentation/dto/request/GetApiLogsRequest';

export class GetApiLogsQuery {
  constructor(public readonly request: GetApiLogsRequest) {}
}
