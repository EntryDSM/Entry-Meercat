import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from '../session/entity/Session.entity';
import { HealthCheck } from '../monitoring/entity/HealthCheck.entity';
import { ApiLog } from '../monitoring/entity/ApiLog.entity';
import { SubmissionSession } from '../submission/entity/SubmissionSession.entity';
import { SubmissionCancellation } from '../submission/entity/SubmissionCancellation.entity';
import { SubmissionEvent } from '../submission/entity/SubmissionEvent.entity';
import { ClientError } from '../error/entity/ClientError.entity';
import { ServerError } from '../error/entity/ServerError.entity';
import { CriticalError } from '../error/entity/CriticalError.entity';
import { PdfOperation } from '../pdf/entity/PdfOperation.entity';
import { NetworkTest } from '../network/entity/NetworkTest.entity';
import { DashboardQueryService } from './service/DashboardQueryService';
import { DashboardController } from './presentation/DashboardController';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Session,
      HealthCheck,
      ApiLog,
      SubmissionSession,
      SubmissionCancellation,
      SubmissionEvent,
      ClientError,
      ServerError,
      CriticalError,
      PdfOperation,
      NetworkTest,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardQueryService],
  exports: [DashboardQueryService],
})
export class DashboardModule {}
