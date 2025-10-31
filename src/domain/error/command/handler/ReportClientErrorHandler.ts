import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportClientErrorCommand } from '../ReportClientErrorCommand';
import { ClientError } from '../../entity/ClientError.entity';
import { ErrorReportResponse } from '../../presentation/dto/response/ErrorReportResponse';
import { WebhookService } from '../../../../global/services/WebhookService';

@CommandHandler(ReportClientErrorCommand)
export class ReportClientErrorHandler implements ICommandHandler<ReportClientErrorCommand, ErrorReportResponse> {
  constructor(
    @InjectRepository(ClientError)
    private readonly clientErrorRepository: Repository<ClientError>,
    private readonly webhookService: WebhookService,
  ) {}

  async execute(command: ReportClientErrorCommand): Promise<ErrorReportResponse> {
    const { request } = command;

    const clientError = ClientError.create(
      request.sessionId || null,
      request.pageType || null,
      request.errorCategory || null,
      request.errorCode || null,
      request.message,
      request.stackTrace || null,
      request.pageUrl || null,
      request.componentName || null,
      request.userAction || null,
    );

    const savedError = await this.clientErrorRepository.save(clientError);

    this.webhookService.sendClientErrorWebhook({
      errorId: savedError.id,
      errorType: 'CLIENT',
      sessionId: savedError.sessionId,
      pageType: savedError.pageType,
      errorCategory: savedError.errorCategory,
      errorCode: savedError.errorCode,
      message: savedError.message,
      stackTrace: savedError.stackTrace,
      pageUrl: savedError.pageUrl,
      componentName: savedError.componentName,
      userAction: savedError.userAction,
      timestamp: savedError.createdAt,
    }).catch(() => {});

    return {
      errorId: savedError.id,
      timestamp: Date.now(),
      status: 'LOGGED',
    };
  }
}
