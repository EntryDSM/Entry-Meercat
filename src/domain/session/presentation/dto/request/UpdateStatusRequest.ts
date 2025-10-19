import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { UserStatus } from '../../../entity/Session.entity';

export class UpdateStatusRequest {
  @ApiProperty({ description: '세션 ID', example: 'uuid-string' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    description: '사용자 상태',
    enum: UserStatus,
    example: UserStatus.BROWSING,
  })
  @IsEnum(UserStatus)
  status: UserStatus;
}
