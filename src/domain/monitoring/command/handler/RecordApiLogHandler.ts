import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordApiLogCommand } from '../RecordApiLogCommand';
import { ApiLog } from '../../entity/ApiLog.entity';

@CommandHandler(RecordApiLogCommand)
export class RecordApiLogHandler implements ICommandHandler<RecordApiLogCommand> {
  constructor(
    @InjectRepository(ApiLog)
    private readonly apiLogRepository: Repository<ApiLog>,
  ) {}

  async execute(command: RecordApiLogCommand): Promise<void> {
    const { request } = command;

    const apiLog = ApiLog.create(
      request.sessionId,
      request.endpoint,
      request.method,
      request.statusCode,
      request.responseTime,
      request.requestSize,
      request.responseSize,
    );

    await this.apiLogRepository.save(apiLog);
  }
}
