import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { ErrorErrorCode } from './code/ErrorErrorCode';

export class ErrorNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        ErrorErrorCode.ERROR_NOT_FOUND,
        '에러를 찾을 수 없습니다',
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}

export class InvalidErrorReportException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        ErrorErrorCode.INVALID_ERROR_REPORT,
        '유효하지 않은 에러 리포트입니다',
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
