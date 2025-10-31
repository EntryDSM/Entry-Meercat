import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StartSessionCommand } from '../StartSessionCommand';
import { Session } from '../../entity/Session.entity';
import { StartSessionResponse } from '../../presentation/dto/response/StartSessionResponse';

@CommandHandler(StartSessionCommand)
export class StartSessionHandler implements ICommandHandler<StartSessionCommand, StartSessionResponse> {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async execute(command: StartSessionCommand): Promise<StartSessionResponse> {
    const { request, ipAddress } = command;

    if (request.existingSessionId) {
      const existingSession = await this.sessionRepository.findOne({
        where: { id: request.existingSessionId },
      });

      if (existingSession && this.canReuseSession(existingSession)) {
        existingSession.markReused();
        existingSession.updateHeartbeat(existingSession.currentPageType);
        await this.sessionRepository.save(existingSession);

        return {
          sessionId: existingSession.id,
          serverTime: Date.now(),
          heartbeatInterval: 30000,
        };
      }
    }

    const deviceInfo = this.parseUserAgent(request.userAgent);

    const session = Session.create(
      ipAddress,
      request.userAgent,
      request.deviceType || deviceInfo.deviceType,
      deviceInfo.osType,
      request.browserType || deviceInfo.browser,
      request.entryPoint || null,
      request.networkTest.latency,
      request.networkTest.downloadSpeed,
      request.domLoadTime,
    );

    await this.sessionRepository.save(session);

    return {
      sessionId: session.id,
      serverTime: Date.now(),
      heartbeatInterval: 30000,
    };
  }

  private canReuseSession(session: Session): boolean {
    if (session.endedAt !== null) {
      return false;
    }

    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
    return session.lastHeartbeatAt >= threeMinutesAgo;
  }

  private parseUserAgent(userAgent: string): {
    deviceType: string;
    osType: string;
    browser: string;
  } {
    const ua = userAgent.toLowerCase();

    let deviceType = 'desktop';
    if (ua.includes('mobile') || ua.includes('android')) {
      deviceType = 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      deviceType = 'tablet';
    }

    let osType = 'unknown';
    if (ua.includes('windows')) osType = 'Windows';
    else if (ua.includes('mac')) osType = 'MacOS';
    else if (ua.includes('linux')) osType = 'Linux';
    else if (ua.includes('android')) osType = 'Android';
    else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad'))
      osType = 'iOS';

    let browser = 'unknown';
    if (ua.includes('edge') || ua.includes('edg/')) browser = 'Edge';
    else if (ua.includes('chrome') && !ua.includes('chromium')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari')) browser = 'Safari';

    return { deviceType, osType, browser };
  }
}
