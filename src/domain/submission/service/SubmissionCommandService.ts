import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RecordSubmissionSuccessCommand } from '../command/RecordSubmissionSuccessCommand';
import { RecordSubmissionCancelCommand } from '../command/RecordSubmissionCancelCommand';
import { RecordCancelSuccessCommand } from '../command/RecordCancelSuccessCommand';
import { RecordCancelCancelCommand } from '../command/RecordCancelCancelCommand';

@Injectable()
export class SubmissionCommandService {
  constructor(private readonly commandBus: CommandBus) {}

  async recordSubmissionSuccess(sessionId: string, submissionId: number): Promise<void> {
    await this.commandBus.execute(new RecordSubmissionSuccessCommand(sessionId, submissionId));
  }

  async recordSubmissionCancel(sessionId: string, submissionId: number, reason?: string): Promise<void> {
    await this.commandBus.execute(new RecordSubmissionCancelCommand(sessionId, submissionId, reason));
  }

  async recordCancelSuccess(sessionId: string, submissionId: number): Promise<void> {
    await this.commandBus.execute(new RecordCancelSuccessCommand(sessionId, submissionId));
  }

  async recordCancelCancel(sessionId: string, submissionId: number, reason?: string): Promise<void> {
    await this.commandBus.execute(new RecordCancelCancelCommand(sessionId, submissionId, reason));
  }
}
