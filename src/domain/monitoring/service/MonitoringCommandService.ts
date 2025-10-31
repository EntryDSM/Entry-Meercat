import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RecordHealthCheckCommand } from '../command/RecordHealthCheckCommand';
import { RecordApiLogCommand } from '../command/RecordApiLogCommand';
import { HealthCheckRequest } from '../presentation/dto/request/HealthCheckRequest';
import { ApiLogRequest } from '../presentation/dto/request/ApiLogRequest';

@Injectable()
export class MonitoringCommandService {
  constructor(private readonly commandBus: CommandBus) {}

  async recordHealthCheck(request: HealthCheckRequest): Promise<void> {
    await this.commandBus.execute(new RecordHealthCheckCommand(request));
  }

  async recordApiLog(request: ApiLogRequest): Promise<void> {
    await this.commandBus.execute(new RecordApiLogCommand(request));
  }
}
