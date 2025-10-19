import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class NetworkTestDto {
  @ApiProperty({ description: '지연시간(ms)', example: 45 })
  @IsNumber()
  latency: number;

  @ApiProperty({ description: '다운로드 속도(KB/s)', example: 125.5 })
  @IsNumber()
  downloadSpeed: number;

  @ApiProperty({ description: '업로드 속도(KB/s)', example: 50.2 })
  @IsNumber()
  uploadSpeed: number;

  @ApiProperty({ description: '지터(ms)', example: 12 })
  @IsNumber()
  jitter: number;

  @ApiProperty({ description: '패킷 손실률(%)', example: 0.5 })
  @IsNumber()
  packetLoss: number;

  @ApiProperty({ description: '연결 타입', example: 'wifi' })
  @IsString()
  connectionType: string;
}

export class StartSessionRequest {
  @ApiProperty({ description: '도메인', example: 'entrydsm.kr' })
  @IsString()
  @IsNotEmpty()
  domain: string;

  @ApiProperty({ description: 'User Agent', example: 'Mozilla/5.0...' })
  @IsString()
  @IsNotEmpty()
  userAgent: string;

  @ApiProperty({ description: '화면 해상도', example: '1920x1080' })
  @IsString()
  @IsOptional()
  screenResolution?: string;

  @ApiProperty({ description: '언어', example: 'ko-KR' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({ description: '타임존', example: 'Asia/Seoul' })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiProperty({ description: '진입 경로', example: '/apply' })
  @IsString()
  @IsOptional()
  entryPoint?: string;

  @ApiProperty({ description: 'Referrer', example: 'https://google.com' })
  @IsString()
  @IsOptional()
  referrer?: string;

  @ApiProperty({ description: '네트워크 테스트 결과', type: NetworkTestDto })
  @ValidateNested()
  @Type(() => NetworkTestDto)
  networkTest: NetworkTestDto;

  @ApiProperty({ description: 'DOM 로드 완료 시간(ms)', example: 1250 })
  @IsNumber()
  domLoadTime: number;

  @ApiProperty({ description: '브라우저 타입', example: 'Chrome', required: false })
  @IsString()
  @IsOptional()
  browserType?: string;

  @ApiProperty({ description: '기기 타입', example: 'desktop', required: false })
  @IsString()
  @IsOptional()
  deviceType?: string;

  @ApiProperty({ description: '기존 세션 ID (재활용)', example: 'uuid-string', required: false })
  @IsString()
  @IsOptional()
  existingSessionId?: string;
}
