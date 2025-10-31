import { ReportCriticalErrorRequest } from '../presentation/dto/request/ReportCriticalErrorRequest';

export class ReportCriticalErrorCommand {
  constructor(public readonly request: ReportCriticalErrorRequest) {}
}
