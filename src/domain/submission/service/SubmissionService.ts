import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubmissionEvent } from '../entity/SubmissionEvent.entity';

/**
 * 제출 서비스
 *
 * @description
 * - 원서 제출 성공/취소 이벤트 기록
 * - 원서 취소 성공/취소 이벤트 기록
 */
@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(SubmissionEvent)
    private readonly eventRepository: Repository<SubmissionEvent>,
  ) {}

  /**
   * 원서 접수 성공 기록
   *
   * @param sessionId - 세션 ID
   * @param submissionId - 제출 ID
   */
  async recordSubmissionSuccess(sessionId: string, submissionId: number): Promise<void> {
    const event = SubmissionEvent.createSubmissionSuccess(sessionId, submissionId);
    await this.eventRepository.save(event);
  }

  /**
   * 원서 접수 취소 기록
   *
   * @param sessionId - 세션 ID
   * @param submissionId - 제출 ID
   * @param reason - 취소 사유 (선택)
   */
  async recordSubmissionCancel(
    sessionId: string,
    submissionId: number,
    reason?: string,
  ): Promise<void> {
    const event = SubmissionEvent.createSubmissionCancel(sessionId, submissionId, reason);
    await this.eventRepository.save(event);
  }

  /**
   * 원서 접수 취소 성공 기록
   *
   * @param sessionId - 세션 ID
   * @param submissionId - 제출 ID
   */
  async recordCancelSuccess(sessionId: string, submissionId: number): Promise<void> {
    const event = SubmissionEvent.createCancelSuccess(sessionId, submissionId);
    await this.eventRepository.save(event);
  }

  /**
   * 원서 접수 취소 취소 기록
   *
   * @param sessionId - 세션 ID
   * @param submissionId - 제출 ID
   * @param reason - 취소 사유 (선택)
   */
  async recordCancelCancel(
    sessionId: string,
    submissionId: number,
    reason?: string,
  ): Promise<void> {
    const event = SubmissionEvent.createCancelCancel(sessionId, submissionId, reason);
    await this.eventRepository.save(event);
  }
}
