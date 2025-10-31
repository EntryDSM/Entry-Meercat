import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { PageType } from '../../session/entity/Session.entity';

@Entity('tbl_client_errors')
export class ClientError {
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

  @Column({ name: 'page_url', type: 'varchar', length: 500, nullable: true })
  pageUrl: string | null;

  @Column({ name: 'component_name', type: 'varchar', length: 100, nullable: true })
  componentName: string | null;

  @Column({ name: 'user_action', type: 'varchar', length: 100, nullable: true })
  userAction: string | null;

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
    pageUrl: string | null,
    componentName: string | null,
    userAction: string | null,
  ): ClientError {
    const error = new ClientError();
    error.sessionId = sessionId;
    error.pageType = pageType;
    error.errorCategory = errorCategory;
    error.errorCode = errorCode;
    error.message = message;
    error.stackTrace = stackTrace;
    error.pageUrl = pageUrl;
    error.componentName = componentName;
    error.userAction = userAction;
    error.resolved = false;
    error.resolvedAt = null;
    return error;
  }

  resolve(): void {
    this.resolved = true;
    this.resolvedAt = new Date();
  }
}
