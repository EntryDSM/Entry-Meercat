import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResponseInterceptor } from '../../../global/interceptors/ResponseInterceptor';
import { AuthService } from '../service/AuthService';
import { LoginRequest } from './dto/request/LoginRequest';
import { LoginResponse } from './dto/response/LoginResponse';

@ApiTags('auth')
@Controller('v1/auth')
@UseInterceptors(ResponseInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: '관리자 로그인' })
  @ApiResponse({ status: 200, type: LoginResponse })
  async login(@Body() request: LoginRequest): Promise<LoginResponse> {
    return this.authService.login(request);
  }
}
