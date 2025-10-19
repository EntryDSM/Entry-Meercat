import { ApiProperty } from '@nestjs/swagger';

export class LoginResponse {
  @ApiProperty({ description: 'JWT 액세스 토큰' })
  accessToken: string;

  @ApiProperty({ description: '관리자 아이디' })
  username: string;
}
