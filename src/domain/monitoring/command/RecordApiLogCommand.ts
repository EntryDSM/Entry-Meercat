import { ApiLogRequest } from '../presentation/dto/request/ApiLogRequest';

export class RecordApiLogCommand {
  constructor(public readonly request: ApiLogRequest) {}
}
