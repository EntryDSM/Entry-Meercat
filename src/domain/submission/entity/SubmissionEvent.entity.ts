import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

export enum SubmissionEventType {
  SUBMISSION_SUCCESS = 'submission_success',
  SUBMISSION_CANCEL = 'submission_cancel',
  CANCEL_SUCCESS = 'cancel_success',
  CANCEL_CANCEL = 'cancel_cancel',
}

@Entity('tbl_submission_events')
@Index(['eventType', 'createdAt'])
@Index(['sessionId'])
export class SubmissionEvent {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: number;

  @Column({ name: 'session_id', type: 'varchar', length: 36 })
  sessionId: string;

  @Column({ name: 'submission_id', type: 'bigint', nullable: true })
  submissionId: number | null;

  @Column({
    name: 'event_type',
    type: 'enum',
    enum: SubmissionEventType,
  })
  eventType: SubmissionEventType;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'metadata', type: 'json', nullable: true })
  metadata: Record<string, unknown> | null;

  static createSubmissionSuccess(sessionId: string, submissionId: number): SubmissionEvent {
    const event = new SubmissionEvent();
    event.sessionId = sessionId;
    event.submissionId = submissionId;
    event.eventType = SubmissionEventType.SUBMISSION_SUCCESS;
    event.metadata = null;
    return event;
  }

  static createSubmissionCancel(sessionId: string, submissionId: number, reason?: string): SubmissionEvent {
    const event = new SubmissionEvent();
    event.sessionId = sessionId;
    event.submissionId = submissionId;
    event.eventType = SubmissionEventType.SUBMISSION_CANCEL;
    event.metadata = reason ? { reason } : null;
    return event;
  }

  static createCancelSuccess(sessionId: string, submissionId: number): SubmissionEvent {
    const event = new SubmissionEvent();
    event.sessionId = sessionId;
    event.submissionId = submissionId;
    event.eventType = SubmissionEventType.CANCEL_SUCCESS;
    event.metadata = null;
    return event;
  }

  static createCancelCancel(sessionId: string, submissionId: number, reason?: string): SubmissionEvent {
    const event = new SubmissionEvent();
    event.sessionId = sessionId;
    event.submissionId = submissionId;
    event.eventType = SubmissionEventType.CANCEL_CANCEL;
    event.metadata = reason ? { reason } : null;
    return event;
  }
}
