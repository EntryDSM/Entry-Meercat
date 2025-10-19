import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { SessionErrorCode } from './code/SessionErrorCode';

export class SessionNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        SessionErrorCode.SESSION_NOT_FOUND,
        '세션을 찾을 수 없습니다',
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
