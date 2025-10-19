import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import * as crypto from 'crypto';

export enum PdfOperationType {
  DOWNLOAD = 'download',
  PREVIEW = 'preview',
}

export enum PdfOperationStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('tbl_pdf_operations')
export class PdfOperation {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string;

  @Column({ name: 'session_id', type: 'varchar', length: 36, nullable: false })
  sessionId: string;

  @Column({
    name: 'operation_type',
    type: 'enum',
    enum: PdfOperationType,
    nullable: false,
  })
  operationType: PdfOperationType;

  @Column({
    name: 'operation_status',
    type: 'enum',
    enum: PdfOperationStatus,
    nullable: false,
  })
  operationStatus: PdfOperationStatus;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize: number | null;

  @Column({ name: 'generation_time', type: 'int', nullable: true })
  generationTime: number | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  static create(
    sessionId: string,
    operationType: PdfOperationType,
    operationStatus: PdfOperationStatus,
    fileSize: number | null,
    generationTime: number | null,
    errorMessage: string | null,
  ): PdfOperation {
    const pdfOperation = new PdfOperation();
    pdfOperation.sessionId = sessionId;
    pdfOperation.operationType = operationType;
    pdfOperation.operationStatus = operationStatus;
    pdfOperation.fileSize = fileSize;
    pdfOperation.generationTime = generationTime;
    pdfOperation.errorMessage = errorMessage;
    return pdfOperation;
  }
}
