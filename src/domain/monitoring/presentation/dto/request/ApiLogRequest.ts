import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class ApiLogRequest {
  @ApiProperty({ description: '세션 ID', example: 'uuid-string' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({ description: 'API 엔드포인트', example: '/api/application/submit' })
  @IsString()
  @IsNotEmpty()
  endpoint: string;

  @ApiProperty({ description: 'HTTP 메서드', example: 'POST' })
  @IsString()
  @IsNotEmpty()
  method: string;

  @ApiProperty({ description: '상태 코드', example: 200 })
  @IsNumber()
  statusCode: number;

  @ApiProperty({ description: '응답 시간(ms)', example: 234 })
  @IsNumber()
  responseTime: number;

  @ApiProperty({ description: '요청 크기(bytes)', example: 1024 })
  @IsNumber()
  requestSize: number;

  @ApiProperty({ description: '응답 크기(bytes)', example: 512 })
  @IsNumber()
  responseSize: number;
}
