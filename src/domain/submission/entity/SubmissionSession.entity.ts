import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum SubmissionStatus {
  IN_PROGRESS = 'in_progress',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  ABANDONED = 'abandoned',
}

@Entity('tbl_submission_sessions')
export class SubmissionSession {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: number;

  @Column({ name: 'session_id', type: 'varchar', length: 36, nullable: true })
  sessionId: string | null;

  @Column({
    name: 'submission_status',
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.IN_PROGRESS,
  })
  submissionStatus: SubmissionStatus;

  @Column({ name: 'form_step', type: 'int', nullable: true })
  formStep: number | null;

  @Column({ name: 'form_completion', type: 'decimal', precision: 5, scale: 2, nullable: true })
  formCompletion: number | null;

  @Column({ name: 'started_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'failed_at', type: 'timestamp', nullable: true })
  failedAt: Date | null;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date | null;

  @Column({ name: 'abandoned_at', type: 'timestamp', nullable: true })
  abandonedAt: Date | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  static create(sessionId: string, formStep: number, formCompletion: number): SubmissionSession {
    const submission = new SubmissionSession();
    submission.sessionId = sessionId;
    submission.submissionStatus = SubmissionStatus.IN_PROGRESS;
    submission.formStep = formStep;
    submission.formCompletion = formCompletion;
    submission.completedAt = null;
    submission.failedAt = null;
    submission.cancelledAt = null;
    submission.abandonedAt = null;
    submission.errorMessage = null;
    return submission;
  }

  updateProgress(formStep: number, formCompletion: number): void {
    this.formStep = formStep;
    this.formCompletion = formCompletion;
  }

  complete(): void {
    this.submissionStatus = SubmissionStatus.SUCCESS;
    this.completedAt = new Date();
  }

  fail(errorMessage: string): void {
    this.submissionStatus = SubmissionStatus.FAILED;
    this.failedAt = new Date();
    this.errorMessage = errorMessage;
  }

  cancel(): void {
    this.submissionStatus = SubmissionStatus.CANCELLED;
    this.cancelledAt = new Date();
  }

  abandon(): void {
    this.submissionStatus = SubmissionStatus.ABANDONED;
    this.abandonedAt = new Date();
  }
}
