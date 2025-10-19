import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class AbandonSubmissionRequest {
  @ApiProperty({ description: '세션 ID', example: 'uuid-string' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({ description: '제출 ID', example: 123 })
  @IsNumber()
  submissionId: number;

  @ApiProperty({ description: '마지막 단계', example: 2 })
  @IsNumber()
  lastStep: number;

  @ApiProperty({ description: '마지막 완료율(%)', example: 45.0 })
  @IsNumber()
  lastCompletion: number;
}
