import { Controller, Post, Get, Body, HttpCode, UseInterceptors, Res, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { ResponseInterceptor } from '../../../global/interceptors/ResponseInterceptor';
import { NetworkService } from '../service/NetworkService';
import { NetworkTestRequest } from './dto/request/NetworkTestRequest';

@ApiTags('Network')
@Controller('v1/network')
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

  @Post('test')
  @HttpCode(204)
  @UseInterceptors(ResponseInterceptor)
  @ApiOperation({ summary: '네트워크 테스트 결과 기록' })
  @ApiResponse({ status: 204, description: '성공적으로 기록됨' })
  async recordNetworkTest(@Body() request: NetworkTestRequest): Promise<void> {
    await this.networkService.recordNetworkTest(request);
  }

  @Get('download/2mb')
  @Header('Content-Type', 'application/octet-stream')
  @Header('Content-Disposition', 'attachment; filename="test-2mb.bin"')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @ApiOperation({
    summary: '2MB 테스트 파일 다운로드',
    description: '네트워크 속도 테스트용 2MB 크기의 더미 파일 다운로드',
  })
  @ApiResponse({ status: 200, description: '2MB 바이너리 파일' })
  async download2MB(@Res() res: Response): Promise<void> {
    const fileSize = 2 * 1024 * 1024; // 2MB
    const buffer = Buffer.alloc(fileSize, 0);

    res.set('Content-Length', fileSize.toString());
    res.send(buffer);
  }
}
