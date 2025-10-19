import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  Req,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { ResponseInterceptor } from '../../../global/interceptors/ResponseInterceptor';
import { SessionService } from '../service/SessionService';
import { StartSessionRequest } from './dto/request/StartSessionRequest';
import { StartSessionResponse } from './dto/response/StartSessionResponse';
import { UpdateStatusRequest } from './dto/request/UpdateStatusRequest';
import { EndSessionRequest } from './dto/request/EndSessionRequest';

@ApiTags('session')
@Controller('v1/session')
@UseInterceptors(ResponseInterceptor)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('start')
  @ApiOperation({ summary: '세션 시작' })
  @ApiResponse({ status: 200, type: StartSessionResponse })
  async startSession(
    @Body() request: StartSessionRequest,
    @Req() req: Request,
  ): Promise<StartSessionResponse> {
    const ipAddress = req.ip || req.socket.remoteAddress || '';
    return this.sessionService.startSession(request, ipAddress);
  }

  @Post('status')
  @HttpCode(204)
  @ApiOperation({ summary: '사용자 상태 변경' })
  @ApiResponse({ status: 204, description: 'No Content' })
  async updateStatus(@Body() request: UpdateStatusRequest): Promise<void> {
    await this.sessionService.updateStatus(request.sessionId, request.status);
  }

  @Post('end')
  @HttpCode(204)
  @ApiOperation({ summary: '세션 종료' })
  @ApiResponse({ status: 204, description: 'No Content' })
  async endSession(@Body() request: EndSessionRequest): Promise<void> {
    await this.sessionService.endSession(request.sessionId, request.reason);
  }
}
