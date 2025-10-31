import { Entity, PrimaryColumn, Column } from 'typeorm';
import * as crypto from 'crypto';

export enum PageType {
  USER = 'USER',
  AUTH = 'AUTH',
  ADMISSION = 'ADMISSION',
}

export enum UserStatus {
  BROWSING = 'browsing',
  AUTHENTICATED = 'authenticated',
}

export enum SessionEndReason {
  TIMEOUT = 'timeout',
  NORMAL = 'normal',
  ERROR = 'error',
}

@Entity('tbl_sessions')
export class Session {
  @PrimaryColumn({ name: 'session_id', length: 36 })
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 50, nullable: true })
  userId: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ name: 'device_type', type: 'varchar', length: 20, nullable: true })
  deviceType: string | null;

  @Column({ name: 'os_type', type: 'varchar', length: 20, nullable: true })
  osType: string | null;

  @Column({ name: 'browser', type: 'varchar', length: 50, nullable: true })
  browser: string | null;

  @Column({ name: 'entry_point', type: 'varchar', length: 255, nullable: true })
  entryPoint: string | null;

  @Column({
    name: 'current_page_type',
    type: 'enum',
    enum: PageType,
    default: PageType.USER,
  })
  currentPageType: PageType;

  @Column({
    name: 'user_status',
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.BROWSING,
  })
  userStatus: UserStatus;

  @Column({ name: 'started_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startedAt: Date;

  @Column({ name: 'last_heartbeat_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastHeartbeatAt: Date;

  @Column({ name: 'ended_at', type: 'timestamp', nullable: true })
  endedAt: Date | null;

  @Column({ name: 'end_reason', type: 'varchar', length: 20, nullable: true })
  endReason: SessionEndReason | null;

  @Column({ name: 'initial_latency', type: 'int', nullable: true })
  initialLatency: number | null;

  @Column({ name: 'download_speed', type: 'decimal', precision: 10, scale: 2, nullable: true })
  downloadSpeed: number | null;

  @Column({ name: 'dom_load_time', type: 'int', nullable: true })
  domLoadTime: number | null;

  @Column({ name: 'reuse_count', type: 'int', default: 0 })
  reuseCount: number;

  @Column({ name: 'last_reused_at', type: 'timestamp', nullable: true })
  lastReusedAt: Date | null;

  static create(
    ipAddress: string | null,
    userAgent: string | null,
    deviceType: string | null,
    osType: string | null,
    browser: string | null,
    entryPoint: string | null,
    initialLatency: number | null,
    downloadSpeed: number | null,
    domLoadTime: number | null,
  ): Session {
    const session = new Session();
    session.id = crypto.randomUUID();
    session.ipAddress = ipAddress;
    session.userAgent = userAgent;
    session.deviceType = deviceType;
    session.osType = osType;
    session.browser = browser;
    session.entryPoint = entryPoint;
    session.initialLatency = initialLatency;
    session.downloadSpeed = downloadSpeed;
    session.domLoadTime = domLoadTime;
    session.userId = null;
    session.currentPageType = PageType.USER;
    session.userStatus = UserStatus.BROWSING;
    session.endedAt = null;
    session.endReason = null;
    session.reuseCount = 0;
    session.lastReusedAt = null;
    return session;
  }

  markReused(): void {
    this.reuseCount += 1;
    this.lastReusedAt = new Date();
  }

  updateHeartbeat(pageType: PageType): void {
    this.lastHeartbeatAt = new Date();
    this.currentPageType = pageType;
  }

  updateStatus(status: UserStatus): void {
    this.userStatus = status;
  }

  end(reason: SessionEndReason): void {
    this.endedAt = new Date();
    this.endReason = reason;
  }
}
