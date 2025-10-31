import { ReportClientErrorRequest } from '../presentation/dto/request/ReportClientErrorRequest';

export class ReportClientErrorCommand {
  constructor(public readonly request: ReportClientErrorRequest) {}
}
