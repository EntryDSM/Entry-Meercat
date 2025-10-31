import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordSubmissionSuccessCommand } from '../RecordSubmissionSuccessCommand';
import { SubmissionEvent } from '../../entity/SubmissionEvent.entity';

@CommandHandler(RecordSubmissionSuccessCommand)
export class RecordSubmissionSuccessHandler implements ICommandHandler<RecordSubmissionSuccessCommand, void> {
  constructor(
    @InjectRepository(SubmissionEvent)
    private readonly eventRepository: Repository<SubmissionEvent>,
  ) {}

  async execute(command: RecordSubmissionSuccessCommand): Promise<void> {
    const event = SubmissionEvent.createSubmissionSuccess(command.sessionId, command.submissionId);
    await this.eventRepository.save(event);
  }
}
