import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import * as crypto from 'crypto';

export enum NetworkQualityRating {
  GOOD = 'good',
  POOR = 'poor',
}

@Entity('tbl_network_tests')
export class NetworkTest {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string;

  @Column({ name: 'session_id', type: 'varchar', length: 36, nullable: false })
  sessionId: string;

  @Column({ name: 'latency', type: 'int', nullable: false })
  latency: number;

  @Column({ name: 'download_speed', type: 'decimal', precision: 10, scale: 2, nullable: false })
  downloadSpeed: number;

  @Column({ name: 'upload_speed', type: 'decimal', precision: 10, scale: 2, nullable: false })
  uploadSpeed: number;

  @Column({ name: 'jitter', type: 'int', nullable: false })
  jitter: number;

  @Column({ name: 'packet_loss', type: 'decimal', precision: 5, scale: 2, nullable: false })
  packetLoss: number;

  @Column({ name: 'connection_type', type: 'varchar', length: 50, nullable: false })
  connectionType: string;

  @Column({
    name: 'quality_rating',
    type: 'enum',
    enum: NetworkQualityRating,
    nullable: false,
  })
  qualityRating: NetworkQualityRating;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  static create(
    sessionId: string,
    latency: number,
    downloadSpeed: number,
    uploadSpeed: number,
    jitter: number,
    packetLoss: number,
    connectionType: string,
    qualityRating: NetworkQualityRating,
  ): NetworkTest {
    const networkTest = new NetworkTest();
    networkTest.sessionId = sessionId;
    networkTest.latency = latency;
    networkTest.downloadSpeed = downloadSpeed;
    networkTest.uploadSpeed = uploadSpeed;
    networkTest.jitter = jitter;
    networkTest.packetLoss = packetLoss;
    networkTest.connectionType = connectionType;
    networkTest.qualityRating = qualityRating;
    return networkTest;
  }
}
