import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { StartSessionCommand } from '../command/StartSessionCommand';
import { UpdateStatusCommand } from '../command/UpdateStatusCommand';
import { EndSessionCommand } from '../command/EndSessionCommand';
import { StartSessionRequest } from '../presentation/dto/request/StartSessionRequest';
import { StartSessionResponse } from '../presentation/dto/response/StartSessionResponse';
import { UserStatus, SessionEndReason } from '../entity/Session.entity';

@Injectable()
export class SessionCommandService {
  constructor(private readonly commandBus: CommandBus) {}

  async startSession(
    request: StartSessionRequest,
    ipAddress: string,
  ): Promise<StartSessionResponse> {
    return this.commandBus.execute(new StartSessionCommand(request, ipAddress));
  }

  async updateStatus(sessionId: string, status: UserStatus): Promise<void> {
    return this.commandBus.execute(new UpdateStatusCommand(sessionId, status));
  }

  async endSession(sessionId: string, reason: SessionEndReason): Promise<void> {
    return this.commandBus.execute(new EndSessionCommand(sessionId, reason));
  }
}
