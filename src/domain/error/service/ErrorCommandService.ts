import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ReportClientErrorCommand } from '../command/ReportClientErrorCommand';
import { ReportServerErrorCommand } from '../command/ReportServerErrorCommand';
import { ReportCriticalErrorCommand } from '../command/ReportCriticalErrorCommand';
import { ResolveClientErrorCommand } from '../command/ResolveClientErrorCommand';
import { ResolveServerErrorCommand } from '../command/ResolveServerErrorCommand';
import { ReportClientErrorRequest } from '../presentation/dto/request/ReportClientErrorRequest';
import { ReportServerErrorRequest } from '../presentation/dto/request/ReportServerErrorRequest';
import { ReportCriticalErrorRequest } from '../presentation/dto/request/ReportCriticalErrorRequest';
import { ErrorReportResponse } from '../presentation/dto/response/ErrorReportResponse';

@Injectable()
export class ErrorCommandService {
  constructor(private readonly commandBus: CommandBus) {}

  async reportClientError(request: ReportClientErrorRequest): Promise<ErrorReportResponse> {
    return this.commandBus.execute(new ReportClientErrorCommand(request));
  }

  async reportServerError(request: ReportServerErrorRequest): Promise<ErrorReportResponse> {
    return this.commandBus.execute(new ReportServerErrorCommand(request));
  }

  async reportCriticalError(request: ReportCriticalErrorRequest): Promise<ErrorReportResponse> {
    return this.commandBus.execute(new ReportCriticalErrorCommand(request));
  }

  async resolveClientError(errorId: number): Promise<void> {
    return this.commandBus.execute(new ResolveClientErrorCommand(errorId));
  }

  async resolveServerError(errorId: number): Promise<void> {
    return this.commandBus.execute(new ResolveServerErrorCommand(errorId));
  }
}
