import { Controller, Post, Get, Body, Query, UseInterceptors, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResponseInterceptor } from '../../../global/interceptors/ResponseInterceptor';
import { MonitoringService } from '../service/MonitoringService';
import { HealthCheckRequest } from './dto/request/HealthCheckRequest';
import { ApiLogRequest } from './dto/request/ApiLogRequest';
import { GetApiLogsRequest } from './dto/request/GetApiLogsRequest';
import { GetHealthChecksRequest } from './dto/request/GetHealthChecksRequest';
import { GetApiLogsResponse } from './dto/response/GetApiLogsResponse';
import { GetHealthChecksResponse } from './dto/response/GetHealthChecksResponse';

@ApiTags('monitoring')
@Controller('v1')
@UseInterceptors(ResponseInterceptor)
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Post('healthcheck')
  @HttpCode(204)
  @ApiOperation({ summary: 'Health check 기록' })
  @ApiResponse({ status: 204, description: 'No Content' })
  async healthCheck(@Body() request: HealthCheckRequest): Promise<void> {
    await this.monitoringService.recordHealthCheck(request);
  }

  @Get('healthcheck/list')
  @ApiOperation({
    summary: 'Health Check 목록 조회',
    description: '세션 ID, 페이지 타입 필터링, 날짜 범위, 페이지네이션 지원',
  })
  @ApiResponse({ status: 200, type: GetHealthChecksResponse })
  async getHealthChecks(@Query() request: GetHealthChecksRequest): Promise<GetHealthChecksResponse> {
    return this.monitoringService.getHealthChecks(request);
  }

  @Post('logs/api')
  @HttpCode(204)
  @ApiOperation({ summary: 'API 로그 기록' })
  @ApiResponse({ status: 204, description: 'No Content' })
  async logApi(@Body() request: ApiLogRequest): Promise<void> {
    await this.monitoringService.recordApiLog(request);
  }

  @Get('logs/api/list')
  @ApiOperation({
    summary: 'API 로그 목록 조회',
    description: '세션 ID, 엔드포인트 필터링, 날짜 범위, 페이지네이션 지원',
  })
  @ApiResponse({ status: 200, type: GetApiLogsResponse })
  async getApiLogs(@Query() request: GetApiLogsRequest): Promise<GetApiLogsResponse> {
    return this.monitoringService.getApiLogs(request);
  }
}
