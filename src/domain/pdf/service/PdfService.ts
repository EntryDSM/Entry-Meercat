import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PdfOperation, PdfOperationType, PdfOperationStatus } from '../entity/PdfOperation.entity';
import { PdfDownloadSuccessRequest } from '../presentation/dto/request/PdfDownloadSuccessRequest';
import { PdfDownloadFailedRequest } from '../presentation/dto/request/PdfDownloadFailedRequest';
import { PdfPreviewSuccessRequest } from '../presentation/dto/request/PdfPreviewSuccessRequest';
import { PdfPreviewFailedRequest } from '../presentation/dto/request/PdfPreviewFailedRequest';

@Injectable()
export class PdfService {
  constructor(
    @InjectRepository(PdfOperation)
    private readonly pdfOperationRepository: Repository<PdfOperation>,
  ) {}

  /**
   * PDF 다운로드 성공 기록
   * @description
   * - PDF 다운로드 성공 정보를 데이터베이스에 저장
   * - 파일 크기 및 생성 시간 기록
   * @param request - PDF 다운로드 성공 요청
   * @returns Promise<void>
   */
  async recordDownloadSuccess(request: PdfDownloadSuccessRequest): Promise<void> {
    const pdfOperation = PdfOperation.create(
      request.sessionId,
      PdfOperationType.DOWNLOAD,
      PdfOperationStatus.SUCCESS,
      request.fileSize,
      request.generationTime,
      null,
    );
    await this.pdfOperationRepository.save(pdfOperation);
  }

  /**
   * PDF 다운로드 실패 기록
   * @description
   * - PDF 다운로드 실패 정보를 데이터베이스에 저장
   * - 에러 메시지 및 시도 시간 기록
   * @param request - PDF 다운로드 실패 요청
   * @returns Promise<void>
   */
  async recordDownloadFailed(request: PdfDownloadFailedRequest): Promise<void> {
    const pdfOperation = PdfOperation.create(
      request.sessionId,
      PdfOperationType.DOWNLOAD,
      PdfOperationStatus.FAILED,
      null,
      request.generationTime,
      request.errorMessage,
    );
    await this.pdfOperationRepository.save(pdfOperation);
  }

  /**
   * PDF 미리보기 성공 기록
   * @description
   * - PDF 미리보기 성공 정보를 데이터베이스에 저장
   * - 파일 크기 및 생성 시간 기록
   * @param request - PDF 미리보기 성공 요청
   * @returns Promise<void>
   */
  async recordPreviewSuccess(request: PdfPreviewSuccessRequest): Promise<void> {
    const pdfOperation = PdfOperation.create(
      request.sessionId,
      PdfOperationType.PREVIEW,
      PdfOperationStatus.SUCCESS,
      request.fileSize,
      request.generationTime,
      null,
    );
    await this.pdfOperationRepository.save(pdfOperation);
  }

  /**
   * PDF 미리보기 실패 기록
   * @description
   * - PDF 미리보기 실패 정보를 데이터베이스에 저장
   * - 에러 메시지 기록
   * @param request - PDF 미리보기 실패 요청
   * @returns Promise<void>
   */
  async recordPreviewFailed(request: PdfPreviewFailedRequest): Promise<void> {
    const pdfOperation = PdfOperation.create(
      request.sessionId,
      PdfOperationType.PREVIEW,
      PdfOperationStatus.FAILED,
      null,
      null,
      request.errorMessage,
    );
    await this.pdfOperationRepository.save(pdfOperation);
  }
}
