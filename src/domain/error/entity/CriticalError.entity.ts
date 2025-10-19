import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { PageType } from '../../session/entity/Session.entity';

@Entity('tbl_critical_errors')
export class CriticalError {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: number;

  @Column({ name: 'session_id', type: 'varchar', length: 36, nullable: true })
  sessionId: string | null;

  @Column({ name: 'page_type', type: 'enum', enum: PageType, nullable: true })
  pageType: PageType | null;

  @Column({ name: 'error_category', type: 'varchar', length: 50, nullable: true })
  errorCategory: string | null;

  @Column({ name: 'error_code', type: 'varchar', length: 50, nullable: true })
  errorCode: string | null;

  @Column({ name: 'message', type: 'text', nullable: true })
  message: string | null;

  @Column({ name: 'stack_trace', type: 'text', nullable: true })
  stackTrace: string | null;

  @Column({ name: 'context', type: 'text', nullable: true })
  context: string | null;

  @Column({ name: 'user_impact', type: 'varchar', length: 100, nullable: true })
  userImpact: string | null;

  @Column({ name: 'resolved', type: 'boolean', default: false })
  resolved: boolean;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt: Date | null;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  static create(
    sessionId: string | null,
    pageType: PageType | null,
    errorCategory: string | null,
    errorCode: string | null,
    message: string | null,
    stackTrace: string | null,
    context: string | null,
    userImpact: string | null,
  ): CriticalError {
    const error = new CriticalError();
    error.sessionId = sessionId;
    error.pageType = pageType;
    error.errorCategory = errorCategory;
    error.errorCode = errorCode;
    error.message = message;
    error.stackTrace = stackTrace;
    error.context = context;
    error.userImpact = userImpact;
    error.resolved = false;
    error.resolvedAt = null;
    return error;
  }

  resolve(): void {
    this.resolved = true;
    this.resolvedAt = new Date();
  }
}
