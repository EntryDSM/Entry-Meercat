import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportCriticalErrorCommand } from '../ReportCriticalErrorCommand';
import { CriticalError } from '../../entity/CriticalError.entity';
import { ErrorReportResponse } from '../../presentation/dto/response/ErrorReportResponse';

@CommandHandler(ReportCriticalErrorCommand)
export class ReportCriticalErrorHandler implements ICommandHandler<ReportCriticalErrorCommand, ErrorReportResponse> {
  constructor(
    @InjectRepository(CriticalError)
    private readonly criticalErrorRepository: Repository<CriticalError>,
  ) {}

  async execute(command: ReportCriticalErrorCommand): Promise<ErrorReportResponse> {
    const { request } = command;

    const criticalError = CriticalError.create(
      request.sessionId || null,
      request.pageType || null,
      request.errorCategory || null,
      request.errorCode || null,
      request.message,
      request.stackTrace || null,
      request.context || null,
      request.userImpact || null,
    );

    const savedError = await this.criticalErrorRepository.save(criticalError);

    return {
      errorId: savedError.id,
      timestamp: Date.now(),
      status: 'LOGGED',
    };
  }
}
