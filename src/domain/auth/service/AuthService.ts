import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Admin } from '../entity/Admin.entity';
import { LoginRequest } from '../presentation/dto/request/LoginRequest';
import { LoginResponse } from '../presentation/dto/response/LoginResponse';
import { InvalidCredentialsException } from '../exception/AuthException';

/**
 * 관리자 인증 서비스
 *
 * @description
 * - 관리자 로그인 처리
 * - JWT 토큰 발급
 * - 비밀번호 검증
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 관리자 로그인
   *
   * @param request - 로그인 요청 정보
   * @returns Promise<LoginResponse> JWT 토큰 및 사용자 정보
   * @throws {InvalidCredentialsException} 인증 실패시
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    const admin = await this.adminRepository.findOne({
      where: { username: request.username },
    });

    if (!admin) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await bcrypt.compare(
      request.password,
      admin.password,
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    const payload = { sub: admin.id, username: admin.username };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      username: admin.username,
    };
  }

  /**
   * 관리자 계정 생성 (개발용)
   *
   * @param username - 관리자 아이디
   * @param password - 비밀번호
   */
  async createAdmin(username: string, password: string): Promise<Admin> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = Admin.create(username, hashedPassword);
    return this.adminRepository.save(admin);
  }

  /**
   * 관리자 계정 조회 (username으로)
   *
   * @param username - 관리자 아이디
   * @returns Promise<Admin | null> 관리자 정보 또는 null
   */
  async findAdminByUsername(username: string): Promise<Admin | null> {
    return this.adminRepository.findOne({
      where: { username },
    });
  }
}
