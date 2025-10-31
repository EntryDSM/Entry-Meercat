import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordCancelCancelCommand } from '../RecordCancelCancelCommand';
import { SubmissionEvent } from '../../entity/SubmissionEvent.entity';

@CommandHandler(RecordCancelCancelCommand)
export class RecordCancelCancelHandler implements ICommandHandler<RecordCancelCancelCommand, void> {
  constructor(
    @InjectRepository(SubmissionEvent)
    private readonly eventRepository: Repository<SubmissionEvent>,
  ) {}

  async execute(command: RecordCancelCancelCommand): Promise<void> {
    const event = SubmissionEvent.createCancelCancel(command.sessionId, command.submissionId, command.reason);
    await this.eventRepository.save(event);
  }
}
