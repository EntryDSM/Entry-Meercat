import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum CancelStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('tbl_submission_cancellations')
export class SubmissionCancellation {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: number;

  @Column({ name: 'session_id', type: 'varchar', length: 36, nullable: true })
  sessionId: string | null;

  @Column({ name: 'submission_id', type: 'bigint', nullable: true })
  submissionId: number | null;

  @Column({
    name: 'cancel_status',
    type: 'enum',
    enum: CancelStatus,
  })
  cancelStatus: CancelStatus;

  @Column({ name: 'reason', type: 'text', nullable: true })
  reason: string | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  static create(
    sessionId: string,
    submissionId: number,
    cancelStatus: CancelStatus,
    reason: string,
    errorMessage: string | null,
  ): SubmissionCancellation {
    const cancellation = new SubmissionCancellation();
    cancellation.sessionId = sessionId;
    cancellation.submissionId = submissionId;
    cancellation.cancelStatus = cancelStatus;
    cancellation.reason = reason;
    cancellation.errorMessage = errorMessage;
    return cancellation;
  }
}
