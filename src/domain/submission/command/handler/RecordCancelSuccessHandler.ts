import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordCancelSuccessCommand } from '../RecordCancelSuccessCommand';
import { SubmissionEvent } from '../../entity/SubmissionEvent.entity';

@CommandHandler(RecordCancelSuccessCommand)
export class RecordCancelSuccessHandler implements ICommandHandler<RecordCancelSuccessCommand, void> {
  constructor(
    @InjectRepository(SubmissionEvent)
    private readonly eventRepository: Repository<SubmissionEvent>,
  ) {}

  async execute(command: RecordCancelSuccessCommand): Promise<void> {
    const event = SubmissionEvent.createCancelSuccess(command.sessionId, command.submissionId);
    await this.eventRepository.save(event);
  }
}
