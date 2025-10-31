import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

/**
 * 웹훅 서비스
 *
 * @description
 * - 클라이언트 에러 웹훅
 * - 서버 에러 웹훅
 * - 비동기 전송, 실패 시 로그만 기록
 */
@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly clientErrorWebhookUrl: string | null;
  private readonly serverErrorWebhookUrl: string | null;

  constructor() {
    this.clientErrorWebhookUrl = process.env.WEBHOOK_CLIENT_ERROR || null;
    this.serverErrorWebhookUrl = process.env.WEBHOOK_SERVER_ERROR || null;
  }

  /**
   * 클라이언트 에러 웹훅 전송
   *
   * @param payload - 에러 데이터
   */
  async sendClientErrorWebhook(payload: Record<string, unknown>): Promise<void> {
    await this.sendWebhook(this.clientErrorWebhookUrl, payload, '클라이언트 에러', {
      title: '클라이언트 에러가 발생했습니다',
      description: '클라이언트 오류.',
      color: 0xffa500,
    });
  }

  /**
   * 서버 에러 웹훅 전송
   *
   * @param payload - 에러 데이터
   */
  async sendServerErrorWebhook(payload: Record<string, unknown>): Promise<void> {
    await this.sendWebhook(this.serverErrorWebhookUrl, payload, '서버 에러', {
      title: '서버 오류!',
      description: '서버 오류가 감지되었습니다.',
      color: 0xff0000,
    });
  }

  /**
   * 공통 웹훅 전송
   *
   * @param url - 웹훅 URL
   * @param payload - 에러 데이터
   * @param logLabel - 로그 라벨
   * @param embed - Discord embed 설정
   */
  private async sendWebhook(
    url: string | null,
    payload: Record<string, unknown>,
    logLabel: string,
    embed: { title: string; description: string; color: number },
  ): Promise<void> {
    if (!url) {
      this.logger.debug(`${logLabel} 웹훅 URL이 설정되지 않았습니다.`);
      return;
    }

    const discordPayload = {
      embeds: [
        {
          title: embed.title,
          description: embed.description,
          color: embed.color,
          fields: [
            {
              name: 'Error Details',
              value: '```json\n' + JSON.stringify(payload, null, 2) + '\n```',
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    try {
      await axios.post(url, discordPayload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
      });
      this.logger.log(`${logLabel} 웹훅 전송 성공`);
    } catch (error) {
      this.logger.error(`${logLabel} 웹훅 전송 실패:`, error instanceof Error ? error.message : String(error));
    }
  }
}
