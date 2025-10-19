import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';

export class PdfPreviewSuccessRequest {
  @ApiProperty({
    description: '세션 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    description: '파일 크기 (bytes)',
    example: 524288,
  })
  @IsNumber()
  @Min(0)
  fileSize: number;

  @ApiProperty({
    description: '생성 시간 (ms)',
    example: 800,
  })
  @IsNumber()
  @Min(0)
  generationTime: number;
}
