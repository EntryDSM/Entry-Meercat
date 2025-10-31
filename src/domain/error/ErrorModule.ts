import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientError } from './entity/ClientError.entity';
import { ServerError } from './entity/ServerError.entity';
import { CriticalError } from './entity/CriticalError.entity';
import { ErrorController } from './presentation/ErrorController';
import { ErrorCommandService } from './service/ErrorCommandService';
import { ErrorQueryService } from './service/ErrorQueryService';
import { WebhookService } from '../../global/services/WebhookService';
import { ReportClientErrorHandler } from './command/handler/ReportClientErrorHandler';
import { ReportServerErrorHandler } from './command/handler/ReportServerErrorHandler';
import { ReportCriticalErrorHandler } from './command/handler/ReportCriticalErrorHandler';
import { ResolveClientErrorHandler } from './command/handler/ResolveClientErrorHandler';
import { ResolveServerErrorHandler } from './command/handler/ResolveServerErrorHandler';
import { GetErrorsHandler } from './query/handler/GetErrorsHandler';

const commandHandlers = [
  ReportClientErrorHandler,
  ReportServerErrorHandler,
  ReportCriticalErrorHandler,
  ResolveClientErrorHandler,
  ResolveServerErrorHandler,
];

const queryHandlers = [GetErrorsHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([ClientError, ServerError, CriticalError]),
  ],
  controllers: [ErrorController],
  providers: [
    ErrorCommandService,
    ErrorQueryService,
    WebhookService,
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class ErrorModule {}
