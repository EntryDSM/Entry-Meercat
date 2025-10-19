import { Controller, Post, Body, HttpCode, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResponseInterceptor } from '../../../global/interceptors/ResponseInterceptor';
import { PdfService } from '../service/PdfService';
import { PdfDownloadSuccessRequest } from './dto/request/PdfDownloadSuccessRequest';
import { PdfDownloadFailedRequest } from './dto/request/PdfDownloadFailedRequest';
import { PdfPreviewSuccessRequest } from './dto/request/PdfPreviewSuccessRequest';
import { PdfPreviewFailedRequest } from './dto/request/PdfPreviewFailedRequest';

@ApiTags('PDF')
@Controller('v1/pdf')
@UseInterceptors(ResponseInterceptor)
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('download-success')
  @HttpCode(204)
  @ApiOperation({ summary: 'PDF 다운로드 성공 기록' })
  @ApiResponse({ status: 204, description: '성공적으로 기록됨' })
  async recordDownloadSuccess(@Body() request: PdfDownloadSuccessRequest): Promise<void> {
    await this.pdfService.recordDownloadSuccess(request);
  }

  @Post('download-failed')
  @HttpCode(204)
  @ApiOperation({ summary: 'PDF 다운로드 실패 기록' })
  @ApiResponse({ status: 204, description: '성공적으로 기록됨' })
  async recordDownloadFailed(@Body() request: PdfDownloadFailedRequest): Promise<void> {
    await this.pdfService.recordDownloadFailed(request);
  }

  @Post('preview-success')
  @HttpCode(204)
  @ApiOperation({ summary: 'PDF 미리보기 성공 기록' })
  @ApiResponse({ status: 204, description: '성공적으로 기록됨' })
  async recordPreviewSuccess(@Body() request: PdfPreviewSuccessRequest): Promise<void> {
    await this.pdfService.recordPreviewSuccess(request);
  }

  @Post('preview-failed')
  @HttpCode(204)
  @ApiOperation({ summary: 'PDF 미리보기 실패 기록' })
  @ApiResponse({ status: 204, description: '성공적으로 기록됨' })
  async recordPreviewFailed(@Body() request: PdfPreviewFailedRequest): Promise<void> {
    await this.pdfService.recordPreviewFailed(request);
  }
}
