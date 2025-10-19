import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { AuthErrorCode } from './code/AuthErrorCode';

export class InvalidCredentialsException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        AuthErrorCode.INVALID_CREDENTIALS,
        '아이디 또는 비밀번호가 일치하지 않습니다',
      ),
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class UnauthorizedException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        AuthErrorCode.UNAUTHORIZED,
        '인증이 필요합니다',
      ),
      HttpStatus.UNAUTHORIZED,
    );
  }
}
