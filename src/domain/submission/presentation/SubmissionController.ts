import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResponseInterceptor } from '../../../global/interceptors/ResponseInterceptor';
import { SubmissionService } from '../service/SubmissionService';
import { StartSubmissionRequest } from './dto/request/StartSubmissionRequest';
import { ProgressSubmissionRequest } from './dto/request/ProgressSubmissionRequest';
import { CompleteSubmissionRequest } from './dto/request/CompleteSubmissionRequest';
import { FailSubmissionRequest } from './dto/request/FailSubmissionRequest';
import { CancelSubmissionRequest } from './dto/request/CancelSubmissionRequest';
import { AbandonSubmissionRequest } from './dto/request/AbandonSubmissionRequest';
import { StartSubmissionResponse } from './dto/response/StartSubmissionResponse';
import { CancelSubmissionResponse } from './dto/response/CancelSubmissionResponse';

@ApiTags('submission')
@Controller('v1/submission')
@UseInterceptors(ResponseInterceptor)
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post('start')
  @ApiOperation({ summary: '원서접수 시작' })
  @ApiResponse({ status: 200, type: StartSubmissionResponse })
  async startSubmission(
    @Body() request: StartSubmissionRequest,
  ): Promise<StartSubmissionResponse> {
    return this.submissionService.startSubmission(request);
  }

  @Post('progress')
  @HttpCode(204)
  @ApiOperation({ summary: '원서접수 진행' })
  @ApiResponse({ status: 204, description: 'No Content' })
  async progressSubmission(
    @Body() request: ProgressSubmissionRequest,
  ): Promise<void> {
    await this.submissionService.updateProgress(
      request.submissionId,
      request.formStep,
      request.formCompletion,
    );
  }

  @Post('complete')
  @HttpCode(204)
  @ApiOperation({ summary: '원서접수 완료' })
  @ApiResponse({ status: 204, description: 'No Content' })
  async completeSubmission(
    @Body() request: CompleteSubmissionRequest,
  ): Promise<void> {
    await this.submissionService.completeSubmission(request.submissionId);
  }

  @Post('failed')
  @HttpCode(204)
  @ApiOperation({ summary: '원서접수 실패' })
  @ApiResponse({ status: 204, description: 'No Content' })
  async failedSubmission(
    @Body() request: FailSubmissionRequest,
  ): Promise<void> {
    await this.submissionService.failSubmission(
      request.submissionId,
      request.errorMessage,
    );
  }

  @Post('cancel')
  @ApiOperation({ summary: '원서접수 취소 시도' })
  @ApiResponse({ status: 200, type: CancelSubmissionResponse })
  async cancelSubmission(
    @Body() request: CancelSubmissionRequest,
  ): Promise<CancelSubmissionResponse> {
    return this.submissionService.cancelSubmission(
      request.sessionId,
      request.submissionId,
      request.reason,
    );
  }

  @Post('abandon')
  @HttpCode(204)
  @ApiOperation({ summary: '원서접수 미제출 이탈' })
  @ApiResponse({ status: 204, description: 'No Content' })
  async abandonSubmission(
    @Body() request: AbandonSubmissionRequest,
  ): Promise<void> {
    await this.submissionService.abandonSubmission(
      request.submissionId,
      request.lastStep,
      request.lastCompletion,
    );
  }
}
