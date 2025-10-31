import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Query,
  Param,
  ParseIntPipe,
  UseInterceptors,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminApiBearerAuth } from '../../../global/decorators/AdminApiBearerAuth';
import { ResponseInterceptor } from '../../../global/interceptors/ResponseInterceptor';
import { ErrorService } from '../service/ErrorService';
import { ReportClientErrorRequest } from './dto/request/ReportClientErrorRequest';
import { ReportServerErrorRequest } from './dto/request/ReportServerErrorRequest';
import { ReportCriticalErrorRequest } from './dto/request/ReportCriticalErrorRequest';
import { ErrorReportResponse } from './dto/response/ErrorReportResponse';
import { GetErrorsRequest } from './dto/request/GetErrorsRequest';
import { GetErrorsResponse } from './dto/response/GetErrorsResponse';

@ApiTags('error')
@Controller('v1/error')
@UseInterceptors(ResponseInterceptor)
export class ErrorController {
  constructor(private readonly errorService: ErrorService) {}

  @Post('client')
  @HttpCode(200)
  @ApiOperation({ summary: '클라이언트 에러 리포트' })
  @ApiResponse({ status: 200, type: ErrorReportResponse })
  async reportClientError(
    @Body() request: ReportClientErrorRequest,
  ): Promise<ErrorReportResponse> {
    return this.errorService.reportClientError(request);
  }

  @Post('server')
  @HttpCode(200)
  @ApiOperation({ summary: '서버 에러 리포트' })
  @ApiResponse({ status: 200, type: ErrorReportResponse })
  async reportServerError(
    @Body() request: ReportServerErrorRequest,
  ): Promise<ErrorReportResponse> {
    return this.errorService.reportServerError(request);
  }

  @Post('critical')
  @HttpCode(200)
  @ApiOperation({ summary: '크리티컬 에러 리포트' })
  @ApiResponse({ status: 200, type: ErrorReportResponse })
  async reportCriticalError(
    @Body() request: ReportCriticalErrorRequest,
  ): Promise<ErrorReportResponse> {
    return this.errorService.reportCriticalError(request);
  }

  @Get('admin/list')
  @ApiOperation({
    summary: '에러 목록 조회 (관리자)',
    description: '에러 타입별 필터링, 날짜 범위, 해결 상태 필터링, 페이지네이션 지원',
  })
  @ApiResponse({ status: 200, type: GetErrorsResponse })
  async getErrors(@Query() request: GetErrorsRequest): Promise<GetErrorsResponse> {
    return this.errorService.getErrors(request);
  }

  @Patch('client/:id/resolve')
  @AdminApiBearerAuth()
  @ApiOperation({ summary: '클라이언트 에러 해결 처리' })
  @ApiResponse({ status: 200, description: '클라이언트 에러 해결 완료' })
  async resolveClientError(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.errorService.resolveClientError(id);
  }

  @Patch('server/:id/resolve')
  @AdminApiBearerAuth()
  @ApiOperation({ summary: '서버 에러 해결 처리' })
  @ApiResponse({ status: 200, description: '서버 에러 해결 완료' })
  async resolveServerError(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.errorService.resolveServerError(id);
  }
}
