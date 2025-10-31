import { SessionEndReason } from '../entity/Session.entity';

export class EndSessionCommand {
  constructor(
    public readonly sessionId: string,
    public readonly reason: SessionEndReason,
  ) {}
}
