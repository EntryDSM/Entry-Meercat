import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { PageType } from '../../session/entity/Session.entity';

@Entity('tbl_health_checks')
export class HealthCheck {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: number;

  @Column({ name: 'session_id', type: 'varchar', length: 36 })
  sessionId: string;

  @Column({ name: 'page_type', type: 'enum', enum: PageType, nullable: true })
  pageType: PageType | null;

  @Column({ name: 'page_url', type: 'varchar', length: 500, nullable: true })
  pageUrl: string | null;

  @Column({ name: 'page_title', type: 'varchar', length: 200, nullable: true })
  pageTitle: string | null;

  @Column({ name: 'dom_load_time', type: 'bigint', nullable: true })
  domLoadTime: number | null;

  @Column({ name: 'page_load_time', type: 'bigint', nullable: true })
  pageLoadTime: number | null;

  @Column({ name: 'memory_usage', type: 'decimal', precision: 10, scale: 2, nullable: true })
  memoryUsage: number | null;

  @Column({ name: 'connection_type', type: 'varchar', length: 20, nullable: true })
  connectionType: string | null;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  static create(
    sessionId: string,
    pageType: PageType | null,
    pageUrl: string | null,
    pageTitle: string | null,
    domLoadTime: number | null,
    pageLoadTime: number | null,
    memoryUsage: number | null,
    connectionType: string | null,
  ): HealthCheck {
    const healthCheck = new HealthCheck();
    healthCheck.sessionId = sessionId;
    healthCheck.pageType = pageType;
    healthCheck.pageUrl = pageUrl;
    healthCheck.pageTitle = pageTitle;
    healthCheck.domLoadTime = domLoadTime;
    healthCheck.pageLoadTime = pageLoadTime;
    healthCheck.memoryUsage = memoryUsage;
    healthCheck.connectionType = connectionType;
    return healthCheck;
  }
}
