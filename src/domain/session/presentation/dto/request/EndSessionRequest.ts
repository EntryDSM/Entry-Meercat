import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class EndSessionRequest {
  @ApiProperty({ description: '세션 ID', example: 'uuid-string' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({ description: '종료 이유', example: 'user_exit' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
