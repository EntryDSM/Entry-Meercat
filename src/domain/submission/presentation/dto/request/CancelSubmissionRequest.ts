import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CancelSubmissionRequest {
  @ApiProperty({ description: '세션 ID', example: 'uuid-string' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({ description: '제출 ID', example: 123 })
  @IsNumber()
  submissionId: number;

  @ApiProperty({ description: '취소 사유', example: 'user_requested' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
