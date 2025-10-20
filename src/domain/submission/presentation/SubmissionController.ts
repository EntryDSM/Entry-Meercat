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
import { RecordSubmissionSuccessRequest } from './dto/request/RecordSubmissionSuccessRequest';
import { RecordSubmissionCancelRequest } from './dto/request/RecordSubmissionCancelRequest';
import { RecordCancelSuccessRequest } from './dto/request/RecordCancelSuccessRequest';
import { RecordCancelCancelRequest } from './dto/request/RecordCancelCancelRequest';

@ApiTags('submission')
@Controller('v1/submission')
@UseInterceptors(ResponseInterceptor)
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post('submission/success')
  @HttpCode(204)
  @ApiOperation({ summary: '원서 접수 성공 기록' })
  @ApiResponse({ status: 204, description: 'No Content' })
  async recordSubmissionSuccess(
    @Body() request: RecordSubmissionSuccessRequest,
  ): Promise<void> {
    await this.submissionService.recordSubmissionSuccess(
      request.sessionId,
      request.submissionId,
    );
  }

  @Post('submission/cancel')
  @HttpCode(204)
  @ApiOperation({ summary: '원서 접수 취소 기록' })
  @ApiResponse({ status: 204, description: 'No Content' })
  async recordSubmissionCancel(
    @Body() request: RecordSubmissionCancelRequest,
  ): Promise<void> {
    await this.submissionService.recordSubmissionCancel(
      request.sessionId,
      request.submissionId,
      request.reason,
    );
  }

  @Post('cancel/success')
  @HttpCode(204)
  @ApiOperation({ summary: '원서 접수 취소 성공 기록' })
  @ApiResponse({ status: 204, description: 'No Content' })
  async recordCancelSuccess(
    @Body() request: RecordCancelSuccessRequest,
  ): Promise<void> {
    await this.submissionService.recordCancelSuccess(
      request.sessionId,
      request.submissionId,
    );
  }

  @Post('cancel/cancel')
  @HttpCode(204)
  @ApiOperation({ summary: '원서 접수 취소 취소 기록' })
  @ApiResponse({ status: 204, description: 'No Content' })
  async recordCancelCancel(
    @Body() request: RecordCancelCancelRequest,
  ): Promise<void> {
    await this.submissionService.recordCancelCancel(
      request.sessionId,
      request.submissionId,
      request.reason,
    );
  }
}
