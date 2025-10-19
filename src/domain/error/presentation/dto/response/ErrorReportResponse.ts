import { ApiProperty } from '@nestjs/swagger';

export class ErrorReportResponse {
  @ApiProperty({ description: '에러 ID', example: 12345 })
  errorId: number;

  @ApiProperty({ description: '처리 시각', example: 1699999999999 })
  timestamp: number;

  @ApiProperty({ description: '상태', example: 'LOGGED' })
  status: string;
}
