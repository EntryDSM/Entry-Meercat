import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateStatusCommand } from '../UpdateStatusCommand';
import { Session } from '../../entity/Session.entity';
import { SessionNotFoundException } from '../../exception/SessionException';

@CommandHandler(UpdateStatusCommand)
export class UpdateStatusHandler implements ICommandHandler<UpdateStatusCommand, void> {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async execute(command: UpdateStatusCommand): Promise<void> {
    const { sessionId, status } = command;

    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new SessionNotFoundException();
    }

    session.updateStatus(status);
    await this.sessionRepository.save(session);
  }
}
