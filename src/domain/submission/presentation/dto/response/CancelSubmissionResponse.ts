import { ApiProperty } from '@nestjs/swagger';

export class CancelSubmissionResponse {
  @ApiProperty({ description: '취소 상태', example: 'success' })
  status: string;

  @ApiProperty({ description: '메시지', example: '취소 완료' })
  message: string;
}
