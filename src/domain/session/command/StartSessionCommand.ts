import { StartSessionRequest } from '../presentation/dto/request/StartSessionRequest';

export class StartSessionCommand {
  constructor(
    public readonly request: StartSessionRequest,
    public readonly ipAddress: string,
  ) {}
}
