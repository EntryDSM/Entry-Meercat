import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportServerErrorCommand } from '../ReportServerErrorCommand';
import { ServerError } from '../../entity/ServerError.entity';
import { ErrorReportResponse } from '../../presentation/dto/response/ErrorReportResponse';
import { WebhookService } from '../../../../global/services/WebhookService';

@CommandHandler(ReportServerErrorCommand)
export class ReportServerErrorHandler implements ICommandHandler<ReportServerErrorCommand, ErrorReportResponse> {
  constructor(
    @InjectRepository(ServerError)
    private readonly serverErrorRepository: Repository<ServerError>,
    private readonly webhookService: WebhookService,
  ) {}

  async execute(command: ReportServerErrorCommand): Promise<ErrorReportResponse> {
    const { request } = command;

    const serverError = ServerError.create(
      request.sessionId || null,
      request.pageType || null,
      request.endpoint || null,
      request.httpMethod || null,
      request.httpStatus || null,
      request.errorCategory || null,
      request.errorCode || null,
      request.message,
      request.stackTrace || null,
      request.requestPayload || null,
      request.responseTime || null,
    );

    const savedError = await this.serverErrorRepository.save(serverError);

    this.webhookService.sendServerErrorWebhook({
      errorId: savedError.id,
      errorType: 'SERVER',
      sessionId: savedError.sessionId,
      pageType: savedError.pageType,
      endpoint: savedError.endpoint,
      httpMethod: savedError.httpMethod,
      httpStatus: savedError.httpStatus,
      errorCategory: savedError.errorCategory,
      errorCode: savedError.errorCode,
      message: savedError.message,
      stackTrace: savedError.stackTrace,
      requestPayload: savedError.requestPayload,
      responseTime: savedError.responseTime,
      timestamp: savedError.createdAt,
    }).catch(() => {});

    return {
      errorId: savedError.id,
      timestamp: Date.now(),
      status: 'LOGGED',
    };
  }
}
