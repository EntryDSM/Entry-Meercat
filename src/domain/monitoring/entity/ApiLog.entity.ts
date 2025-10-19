import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tbl_api_logs')
export class ApiLog {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: number;

  @Column({ name: 'session_id', type: 'varchar', length: 36, nullable: true })
  sessionId: string | null;

  @Column({ name: 'endpoint', type: 'varchar', length: 255, nullable: true })
  endpoint: string | null;

  @Column({ name: 'method', type: 'varchar', length: 10, nullable: true })
  method: string | null;

  @Column({ name: 'status_code', type: 'int', nullable: true })
  statusCode: number | null;

  @Column({ name: 'response_time', type: 'int', nullable: true })
  responseTime: number | null;

  @Column({ name: 'request_size', type: 'int', nullable: true })
  requestSize: number | null;

  @Column({ name: 'response_size', type: 'int', nullable: true })
  responseSize: number | null;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  static create(
    sessionId: string | null,
    endpoint: string | null,
    method: string | null,
    statusCode: number | null,
    responseTime: number | null,
    requestSize: number | null,
    responseSize: number | null,
  ): ApiLog {
    const apiLog = new ApiLog();
    apiLog.sessionId = sessionId;
    apiLog.endpoint = endpoint;
    apiLog.method = method;
    apiLog.statusCode = statusCode;
    apiLog.responseTime = responseTime;
    apiLog.requestSize = requestSize;
    apiLog.responseSize = responseSize;
    return apiLog;
  }
}
