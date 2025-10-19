import { ApiProperty } from '@nestjs/swagger';

export class StartSessionResponse {
  @ApiProperty({ description: '세션 ID', example: 'uuid-string' })
  sessionId: string;

  @ApiProperty({ description: '서버 시간(timestamp)', example: 1728812345678 })
  serverTime: number;

  @ApiProperty({ description: 'Heartbeat 간격(ms)', example: 30000 })
  heartbeatInterval: number;
}
