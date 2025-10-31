import { HealthCheckRequest } from '../presentation/dto/request/HealthCheckRequest';

export class RecordHealthCheckCommand {
  constructor(public readonly request: HealthCheckRequest) {}
}
