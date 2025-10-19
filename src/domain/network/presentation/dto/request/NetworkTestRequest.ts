import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsNotEmpty, Min, Max } from 'class-validator';
import { NetworkQualityRating } from '../../../entity/NetworkTest.entity';

export class NetworkTestRequest {
  @ApiProperty({
    description: '세션 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    description: '지연 시간 (ms)',
    example: 45,
  })
  @IsNumber()
  @Min(0)
  latency: number;

  @ApiProperty({
    description: '다운로드 속도 (Mbps)',
    example: 100.50,
  })
  @IsNumber()
  @Min(0)
  downloadSpeed: number;

  @ApiProperty({
    description: '업로드 속도 (Mbps)',
    example: 50.25,
  })
  @IsNumber()
  @Min(0)
  uploadSpeed: number;

  @ApiProperty({
    description: '지터 (ms)',
    example: 5,
  })
  @IsNumber()
  @Min(0)
  jitter: number;

  @ApiProperty({
    description: '패킷 손실률 (%)',
    example: 0.5,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  packetLoss: number;

  @ApiProperty({
    description: '연결 타입',
    example: 'wifi',
  })
  @IsString()
  @IsNotEmpty()
  connectionType: string;

  @ApiProperty({
    description: '품질 평가',
    enum: NetworkQualityRating,
    example: NetworkQualityRating.GOOD,
  })
  @IsEnum(NetworkQualityRating)
  qualityRating: NetworkQualityRating;
}
