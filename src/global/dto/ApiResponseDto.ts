import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({ description: '성공 여부' })
  success: boolean;

  @ApiProperty({ description: '응답 데이터', required: false })
  data?: T;

  @ApiProperty({ description: '에러 코드', required: false })
  errorCode?: string;

  @ApiProperty({ description: '에러 메시지', required: false })
  message?: string;

  static success<T>(data?: T): ApiResponseDto<T> {
    return {
      success: true,
      data,
    };
  }

  static error(errorCode: string, message: string): ApiResponseDto {
    return {
      success: false,
      errorCode,
      message,
    };
  }
}
