import { ApiProperty } from '@nestjs/swagger';

export class StartSubmissionResponse {
  @ApiProperty({ description: '제출 ID', example: 123 })
  submissionId: number;
}
