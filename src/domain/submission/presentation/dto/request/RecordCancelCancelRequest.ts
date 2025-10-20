import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class RecordCancelCancelRequest {
  @ApiProperty({ description: '세션 ID' })
  @IsString()
  sessionId: string;

  @ApiProperty({ description: '제출 ID' })
  @IsNumber()
  submissionId: number;

  @ApiProperty({ description: '취소 사유', required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}
