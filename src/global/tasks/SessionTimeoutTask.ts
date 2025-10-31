import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull } from 'typeorm';
import { Session, SessionEndReason } from '../../domain/session/entity/Session.entity';

/**
 * 세션 타임아웃 처리 스케줄러
 *
 * @description
 * - 매 1분마다 실행
 * - 2분 이상 heartbeat 없는 세션 종료 처리
 */
@Injectable()
export class SessionTimeoutTask {
  private readonly logger = new Logger(SessionTimeoutTask.name);

  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleSessionTimeout() {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    try {
      const result = await this.sessionRepository
        .createQueryBuilder()
        .update(Session)
        .set({
          endedAt: () => 'NOW()',
          endReason: SessionEndReason.TIMEOUT,
        })
        .where('ended_at IS NULL')
        .andWhere('last_heartbeat_at < :twoMinutesAgo', { twoMinutesAgo })
        .execute();

      if (result.affected && result.affected > 0) {
        this.logger.log(`Timed out ${result.affected} inactive sessions`);
      }
    } catch (error) {
      this.logger.error('Failed to handle session timeout', error);
    }
  }
}
