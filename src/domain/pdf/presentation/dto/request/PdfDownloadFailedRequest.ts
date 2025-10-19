import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';

export class PdfDownloadFailedRequest {
  @ApiProperty({
    description: '세션 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    description: '에러 메시지',
    example: 'PDF generation timeout',
  })
  @IsString()
  @IsNotEmpty()
  errorMessage: string;

  @ApiProperty({
    description: '생성 시도 시간 (ms)',
    example: 3000,
  })
  @IsNumber()
  @Min(0)
  generationTime: number;
}
