import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { PageType } from '../../session/entity/Session.entity';

@Entity('tbl_server_errors')
export class ServerError {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: number;

  @Column({ name: 'session_id', type: 'varchar', length: 36, nullable: true })
  sessionId: string | null;

  @Column({ name: 'page_type', type: 'enum', enum: PageType, nullable: true })
  pageType: PageType | null;

  @Column({ name: 'endpoint', type: 'varchar', length: 255, nullable: true })
  endpoint: string | null;

  @Column({ name: 'http_method', type: 'varchar', length: 10, nullable: true })
  httpMethod: string | null;

  @Column({ name: 'http_status', type: 'int', nullable: true })
  httpStatus: number | null;

  @Column({ name: 'error_category', type: 'varchar', length: 50, nullable: true })
  errorCategory: string | null;

  @Column({ name: 'error_code', type: 'varchar', length: 50, nullable: true })
  errorCode: string | null;

  @Column({ name: 'message', type: 'text', nullable: true })
  message: string | null;

  @Column({ name: 'stack_trace', type: 'text', nullable: true })
  stackTrace: string | null;

  @Column({ name: 'request_payload', type: 'text', nullable: true })
  requestPayload: string | null;

  @Column({ name: 'response_time', type: 'int', nullable: true })
  responseTime: number | null;

  @Column({ name: 'resolved', type: 'boolean', default: false })
  resolved: boolean;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt: Date | null;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  static create(
    sessionId: string | null,
    pageType: PageType | null,
    endpoint: string | null,
    httpMethod: string | null,
    httpStatus: number | null,
    errorCategory: string | null,
    errorCode: string | null,
    message: string | null,
    stackTrace: string | null,
    requestPayload: string | null,
    responseTime: number | null,
  ): ServerError {
    const error = new ServerError();
    error.sessionId = sessionId;
    error.pageType = pageType;
    error.endpoint = endpoint;
    error.httpMethod = httpMethod;
    error.httpStatus = httpStatus;
    error.errorCategory = errorCategory;
    error.errorCode = errorCode;
    error.message = message;
    error.stackTrace = stackTrace;
    error.requestPayload = requestPayload;
    error.responseTime = responseTime;
    error.resolved = false;
    error.resolvedAt = null;
    return error;
  }

  resolve(): void {
    this.resolved = true;
    this.resolvedAt = new Date();
  }
}
