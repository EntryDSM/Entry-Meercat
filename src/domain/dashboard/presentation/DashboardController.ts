import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResponseInterceptor } from '../../../global/interceptors/ResponseInterceptor';
import { DashboardQueryService } from '../service/DashboardQueryService';
import { DashboardRealtimeResponse } from './dto/response/DashboardRealtimeResponse';

@ApiTags('dashboard')
@Controller('v1/dashboard')
@UseInterceptors(ResponseInterceptor)
export class DashboardController {
  constructor(private readonly dashboardQueryService: DashboardQueryService) {}

  @Get('realtime')
  @ApiOperation({ summary: '대시보드 실시간 데이터 조회' })
  @ApiResponse({ status: 200, type: DashboardRealtimeResponse })
  async getRealtimeData(): Promise<DashboardRealtimeResponse> {
    return this.dashboardQueryService.getRealtimeData();
  }
}
