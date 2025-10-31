import { UserStatus } from '../entity/Session.entity';

export class UpdateStatusCommand {
  constructor(
    public readonly sessionId: string,
    public readonly status: UserStatus,
  ) {}
}
