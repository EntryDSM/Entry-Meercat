import { ReportServerErrorRequest } from '../presentation/dto/request/ReportServerErrorRequest';

export class ReportServerErrorCommand {
  constructor(public readonly request: ReportServerErrorRequest) {}
}
