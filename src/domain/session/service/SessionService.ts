import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session, PageType, UserStatus, SessionEndReason } from '../entity/Session.entity';
import { StartSessionRequest } from '../presentation/dto/request/StartSessionRequest';
import { StartSessionResponse } from '../presentation/dto/response/StartSessionResponse';
import { SessionNotFoundException } from '../exception/SessionException';

/**
 * 세션 서비스
 *
 * @description
 * - 세션 생성 및 관리
 * - Heartbeat 업데이트
 * - 상태 변경 처리
 */
@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  /**
   * 세션 시작
   *
   * @description
   * - 기존 세션 ID가 있으면 재활용 시도 (3분 이내, 종료되지 않음)
   * - 조건 미충족 시 새 세션 생성
   * - 클라이언트가 제공한 browserType, deviceType 우선 사용
   *
   * @param request - 세션 시작 요청
   * @param ipAddress - 클라이언트 IP 주소
   * @returns Promise<StartSessionResponse> 세션 정보
   */
  async startSession(
    request: StartSessionRequest,
    ipAddress: string,
  ): Promise<StartSessionResponse> {
    // 기존 세션 재활용 시도
    if (request.existingSessionId) {
      const existingSession = await this.sessionRepository.findOne({
        where: { id: request.existingSessionId },
      });

      if (existingSession && this.canReuseSession(existingSession)) {
        // 세션 재활용: heartbeat 업데이트 및 재사용 카운트 증가
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

    // 새 세션 생성
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

  /**
   * 세션 재활용 가능 여부 확인
   *
   * @description
   * - 세션이 종료되지 않았고
   * - lastHeartbeatAt 기준 3분 이내인 경우 재활용 가능
   *
   * @param session - 확인할 세션
   * @returns boolean 재활용 가능 여부
   */
  private canReuseSession(session: Session): boolean {
    if (session.endedAt !== null) {
      return false;
    }

    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
    return session.lastHeartbeatAt >= threeMinutesAgo;
  }

  /**
   * 세션 상태 업데이트
   *
   * @param sessionId - 세션 ID
   * @param status - 변경할 상태
   */
  async updateStatus(sessionId: string, status: UserStatus): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new SessionNotFoundException();
    }

    session.updateStatus(status);
    await this.sessionRepository.save(session);
  }

  /**
   * 세션 종료
   *
   * @param sessionId - 세션 ID
   * @param reason - 종료 이유
   */
  async endSession(sessionId: string, reason: SessionEndReason): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new SessionNotFoundException();
    }

    session.end(reason);
    await this.sessionRepository.save(session);
  }

  /**
   * User Agent 파싱
   *
   * @param userAgent - User Agent 문자열
   * @returns 파싱된 디바이스 정보
   */
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
