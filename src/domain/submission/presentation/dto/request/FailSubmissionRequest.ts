import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class FailSubmissionRequest {
  @ApiProperty({ description: '세션 ID', example: 'uuid-string' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({ description: '제출 ID', example: 123 })
  @IsNumber()
  submissionId: number;

  @ApiProperty({ description: '에러 메시지', example: '서버 오류' })
  @IsString()
  @IsNotEmpty()
  errorMessage: string;
}
