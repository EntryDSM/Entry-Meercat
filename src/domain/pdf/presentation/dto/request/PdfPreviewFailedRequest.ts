import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class PdfPreviewFailedRequest {
  @ApiProperty({
    description: '세션 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    description: '에러 메시지',
    example: 'Preview generation failed',
  })
  @IsString()
  @IsNotEmpty()
  errorMessage: string;
}
