import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class RecordSubmissionSuccessRequest {
  @ApiProperty({ description: '세션 ID' })
  @IsString()
  sessionId: string;

  @ApiProperty({ description: '제출 ID' })
  @IsNumber()
  submissionId: number;
}
