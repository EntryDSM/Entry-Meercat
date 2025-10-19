import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class StartSubmissionRequest {
  @ApiProperty({ description: '세션 ID', example: 'uuid-string' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({ description: '폼 단계', example: 1 })
  @IsNumber()
  formStep: number;

  @ApiProperty({ description: '폼 완료율(%)', example: 30.5 })
  @IsNumber()
  formCompletion: number;
}
