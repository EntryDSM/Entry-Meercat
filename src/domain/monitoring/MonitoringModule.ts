import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { HealthCheck } from './entity/HealthCheck.entity';
import { ApiLog } from './entity/ApiLog.entity';
import { Session } from '../session/entity/Session.entity';
import { MonitoringCommandService } from './service/MonitoringCommandService';
import { MonitoringQueryService } from './service/MonitoringQueryService';
import { MonitoringController } from './presentation/MonitoringController';
import { RecordHealthCheckHandler } from './command/handler/RecordHealthCheckHandler';
import { RecordApiLogHandler } from './command/handler/RecordApiLogHandler';
import { GetApiLogsHandler } from './query/handler/GetApiLogsHandler';
import { GetHealthChecksHandler } from './query/handler/GetHealthChecksHandler';

const commandHandlers = [RecordHealthCheckHandler, RecordApiLogHandler];
const queryHandlers = [GetApiLogsHandler, GetHealthChecksHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([HealthCheck, ApiLog, Session]),
  ],
  controllers: [MonitoringController],
  providers: [
    MonitoringCommandService,
    MonitoringQueryService,
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class MonitoringModule {}
