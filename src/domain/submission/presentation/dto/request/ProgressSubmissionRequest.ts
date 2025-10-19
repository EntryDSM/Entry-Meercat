import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class ProgressSubmissionRequest {
  @ApiProperty({ description: '세션 ID', example: 'uuid-string' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({ description: '제출 ID', example: 123 })
  @IsNumber()
  submissionId: number;

  @ApiProperty({ description: '폼 단계', example: 2 })
  @IsNumber()
  formStep: number;

  @ApiProperty({ description: '폼 완료율(%)', example: 65.0 })
  @IsNumber()
  formCompletion: number;
}
