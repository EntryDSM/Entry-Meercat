import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordSubmissionCancelCommand } from '../RecordSubmissionCancelCommand';
import { SubmissionEvent } from '../../entity/SubmissionEvent.entity';

@CommandHandler(RecordSubmissionCancelCommand)
export class RecordSubmissionCancelHandler implements ICommandHandler<RecordSubmissionCancelCommand, void> {
  constructor(
    @InjectRepository(SubmissionEvent)
    private readonly eventRepository: Repository<SubmissionEvent>,
  ) {}

  async execute(command: RecordSubmissionCancelCommand): Promise<void> {
    const event = SubmissionEvent.createSubmissionCancel(command.sessionId, command.submissionId, command.reason);
    await this.eventRepository.save(event);
  }
}
