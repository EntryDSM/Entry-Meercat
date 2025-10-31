import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { SessionEndReason } from '../../../entity/Session.entity';

export class EndSessionRequest {
  @ApiProperty({ description: '세션 ID', example: 'uuid-string' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    description: '종료 이유',
    example: SessionEndReason.NORMAL,
    enum: SessionEndReason,
  })
  @IsEnum(SessionEndReason)
  @IsNotEmpty()
  reason: SessionEndReason;
}
