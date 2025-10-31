import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordHealthCheckCommand } from '../RecordHealthCheckCommand';
import { HealthCheck } from '../../entity/HealthCheck.entity';
import { Session } from '../../../session/entity/Session.entity';

@CommandHandler(RecordHealthCheckCommand)
export class RecordHealthCheckHandler implements ICommandHandler<RecordHealthCheckCommand> {
  constructor(
    @InjectRepository(HealthCheck)
    private readonly healthCheckRepository: Repository<HealthCheck>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async execute(command: RecordHealthCheckCommand): Promise<void> {
    const { request } = command;

    const healthCheck = HealthCheck.create(
      request.sessionId,
      request.pageType,
      request.page.url,
      request.page.title,
      request.page.domLoadTime,
      request.page.pageLoadTime,
      request.performance.memoryUsage,
      request.performance.connectionType,
    );

    await this.healthCheckRepository.save(healthCheck);

    await this.sessionRepository.update(
      { id: request.sessionId },
      {
        lastHeartbeatAt: new Date(),
        currentPageType: request.pageType,
      },
    );
  }
}
