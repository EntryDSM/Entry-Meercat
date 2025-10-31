import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EndSessionCommand } from '../EndSessionCommand';
import { Session } from '../../entity/Session.entity';
import { SessionNotFoundException } from '../../exception/SessionException';

@CommandHandler(EndSessionCommand)
export class EndSessionHandler implements ICommandHandler<EndSessionCommand, void> {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async execute(command: EndSessionCommand): Promise<void> {
    const { sessionId, reason } = command;

    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new SessionNotFoundException();
    }

    session.end(reason);
    await this.sessionRepository.save(session);
  }
}
