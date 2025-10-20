import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SubmissionSession,
  SubmissionStatus,
} from '../entity/SubmissionSession.entity';
import {
  SubmissionCancellation,
  CancelStatus,
} from '../entity/SubmissionCancellation.entity';
import { SubmissionEvent } from '../entity/SubmissionEvent.entity';
import { StartSubmissionRequest } from '../presentation/dto/request/StartSubmissionRequest';
import { StartSubmissionResponse } from '../presentation/dto/response/StartSubmissionResponse';
import { CancelSubmissionResponse } from '../presentation/dto/response/CancelSubmissionResponse';

/**
 * 제출 서비스
 *
 * @description
 * - 원서 제출 세션 관리
 * - 제출 진행 상태 추적
 * - 취소 및 포기 처리
 */
@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(SubmissionSession)
    private readonly submissionRepository: Repository<SubmissionSession>,
    @InjectRepository(SubmissionCancellation)
    private readonly cancellationRepository: Repository<SubmissionCancellation>,
    @InjectRepository(SubmissionEvent)
    private readonly eventRepository: Repository<SubmissionEvent>,
  ) {}

  /**
   * 제출 시작
   *
   * @param request - 제출 시작 요청
   * @returns Promise<StartSubmissionResponse> 제출 ID
   */
  async startSubmission(
    request: StartSubmissionRequest,
  ): Promise<StartSubmissionResponse> {
    const submission = SubmissionSession.create(
      request.sessionId,
      request.formStep,
      request.formCompletion,
    );

    const saved = await this.submissionRepository.save(submission);

    return { submissionId: saved.id };
  }

  /**
   * 제출 진행 업데이트
   *
   * @param submissionId - 제출 ID
   * @param formStep - 현재 단계
   * @param formCompletion - 완료율
   */
  async updateProgress(
    submissionId: number,
    formStep: number,
    formCompletion: number,
  ): Promise<void> {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException('제출 세션을 찾을 수 없습니다');
    }

    submission.updateProgress(formStep, formCompletion);
    await this.submissionRepository.save(submission);
  }

  /**
   * 제출 완료
   *
   * @param submissionId - 제출 ID
   */
  async completeSubmission(submissionId: number): Promise<void> {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException('제출 세션을 찾을 수 없습니다');
    }

    submission.complete();
    await this.submissionRepository.save(submission);

    // 제출 성공 이벤트 기록
    if (submission.sessionId) {
      const event = SubmissionEvent.createSuccess(submission.sessionId, submission.id);
      await this.eventRepository.save(event);
    }
  }

  /**
   * 제출 실패
   *
   * @param submissionId - 제출 ID
   * @param errorMessage - 에러 메시지
   */
  async failSubmission(
    submissionId: number,
    errorMessage: string,
  ): Promise<void> {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException('제출 세션을 찾을 수 없습니다');
    }

    submission.fail(errorMessage);
    await this.submissionRepository.save(submission);
  }

  /**
   * 제출 취소
   *
   * @param sessionId - 세션 ID
   * @param submissionId - 제출 ID
   * @param reason - 취소 사유
   * @returns Promise<CancelSubmissionResponse> 취소 결과
   */
  async cancelSubmission(
    sessionId: string,
    submissionId: number,
    reason: string,
  ): Promise<CancelSubmissionResponse> {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
    });

    if (!submission) {
      const cancellation = SubmissionCancellation.create(
        sessionId,
        submissionId,
        CancelStatus.FAILED,
        reason,
        '제출 세션을 찾을 수 없습니다',
      );
      await this.cancellationRepository.save(cancellation);

      return {
        status: 'failed',
        message: '제출 세션을 찾을 수 없습니다',
      };
    }

    submission.cancel();
    await this.submissionRepository.save(submission);

    const cancellation = SubmissionCancellation.create(
      sessionId,
      submissionId,
      CancelStatus.SUCCESS,
      reason,
      null,
    );
    await this.cancellationRepository.save(cancellation);

    // 제출 취소 이벤트 기록
    const event = SubmissionEvent.createCancelled(sessionId, submissionId, reason);
    await this.eventRepository.save(event);

    return {
      status: 'success',
      message: '취소 완료',
    };
  }

  /**
   * 제출 포기 (미제출 이탈)
   *
   * @param submissionId - 제출 ID
   * @param lastStep - 마지막 단계
   * @param lastCompletion - 마지막 완료율
   */
  async abandonSubmission(
    submissionId: number,
    lastStep: number,
    lastCompletion: number,
  ): Promise<void> {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException('제출 세션을 찾을 수 없습니다');
    }

    submission.updateProgress(lastStep, lastCompletion);
    submission.abandon();
    await this.submissionRepository.save(submission);
  }
}
