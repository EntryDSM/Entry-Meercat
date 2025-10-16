# Entry Meercat - APM Server

**Entry Meercat**는 EntryDSM 프로젝트를 위한 Application Performance Monitoring 서버입니다.

## 🏗️ 아키텍처

### DDD (Domain-Driven Design) 구조

```
src/
├── domain/
│   ├── auth/              # 관리자 인증
│   ├── session/           # 세션 관리
│   ├── monitoring/        # 모니터링 (Health Check, API Logs)
│   ├── error/             # 에러 추적 (Client, Server, Critical)
│   ├── submission/        # 원서 제출 추적
│   ├── pdf/               # PDF 작업 추적
│   ├── network/           # 네트워크 품질 테스트
│   └── dashboard/         # 대시보드 (CQRS Query Service)
└── global/
    ├── dto/               # 공통 DTO
    ├── decorators/        # 커스텀 데코레이터
    ├── filters/           # 예외 필터
    ├── guards/            # 인증 가드
    ├── interceptors/      # 응답 인터셉터
    ├── strategies/        # Passport 전략
    └── tasks/             # 스케줄러 태스크
```

### 주요 특징

- ✅ **DDD 아키텍처**: 도메인별 명확한 분리, 높은 응집도
- ✅ **CQRS 패턴**: Command(Write)와 Query(Read) 분리
- ✅ **Clean Code**: CLAUDE.md 가이드라인 준수
- ✅ **TypeScript Strict Mode**: 타입 안정성 보장
- ✅ **Swagger API 문서**: 자동 생성된 API 문서
- ✅ **JWT 인증**: 30일 만료 토큰
- ✅ **자동 세션 타임아웃**: 2분 비활성 시 자동 종료
- ✅ **Validation**: class-validator로 요청 검증

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+
- MySQL 8.0+
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 데이터베이스 설정을 수정하세요
```

### 데이터베이스 설정

```bash
# MySQL 데이터베이스 생성
mysql -u root -p
CREATE DATABASE entrydsm_apm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# 테이블 생성
mysql -u root -p entrydsm_apm < database-schema.sql
```

### 실행

```bash
# 개발 모드
npm run start:dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm run start:prod
```

## 📚 API 문서

서버 실행 후 다음 URL에서 Swagger API 문서를 확인할 수 있습니다:

```
http://localhost:3000/api
```

## 🔐 관리자 인증

### 기본 계정

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **보안 주의**: 프로덕션 환경에서는 반드시 비밀번호를 변경하세요!

### 로그인

```bash
POST http://localhost:3000/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

응답:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "username": "admin"
  }
}
```

### 인증이 필요한 API 호출

```bash
GET http://localhost:3000/v1/dashboard/realtime
Authorization: Bearer {accessToken}
```

## 🎯 주요 API 엔드포인트

### 세션 관리
- `POST /v1/session/start` - 세션 시작
- `POST /v1/session/status` - 사용자 상태 변경
- `POST /v1/session/end` - 세션 종료

### 모니터링
- `POST /v1/healthcheck` - Health check 기록
- `POST /v1/logs/api` - API 로그 기록

### 에러 추적
- `POST /v1/errors/client` - 클라이언트 에러 기록
- `POST /v1/errors/server` - 서버 에러 기록
- `POST /v1/errors/critical` - 크리티컬 에러 기록

### 원서 제출
- `POST /v1/submission/start` - 제출 시작
- `POST /v1/submission/progress` - 진행 업데이트
- `POST /v1/submission/complete` - 제출 완료
- `POST /v1/submission/failed` - 제출 실패
- `POST /v1/submission/cancel` - 제출 취소
- `POST /v1/submission/abandon` - 미제출 이탈

### PDF 작업
- `POST /v1/pdf/download-success` - 다운로드 성공
- `POST /v1/pdf/download-failed` - 다운로드 실패
- `POST /v1/pdf/preview-success` - 미리보기 성공
- `POST /v1/pdf/preview-failed` - 미리보기 실패

### 네트워크 테스트
- `POST /v1/network/test` - 네트워크 품질 기록

### 대시보드 (관리자 전용)
- `GET /v1/dashboard/realtime` - 실시간 대시보드 데이터

## 🔧 환경 변수

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=entrydsm_apm

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Admin Default Account
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

## 📊 데이터베이스 스키마

### 주요 테이블

1. **admins** - 관리자 계정
2. **sessions** - 세션 정보
3. **health_checks** - Health check 기록
4. **api_logs** - API 로그
5. **client_errors** - 클라이언트 에러
6. **server_errors** - 서버 에러
7. **critical_errors** - 크리티컬 에러
8. **submission_sessions** - 제출 세션
9. **submission_cancellations** - 제출 취소 기록
10. **pdf_operations** - PDF 작업 기록
11. **network_tests** - 네트워크 테스트 결과

자세한 스키마는 `database-schema.sql` 파일을 참고하세요.

## 🧹 데이터 정리

성능 유지를 위해 주기적으로 오래된 데이터를 정리하세요:

```sql
-- 30일 이상 된 health checks 삭제
DELETE FROM health_checks WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- 90일 이상 된 api logs 삭제
DELETE FROM api_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- 90일 이상 된 종료된 세션 삭제
DELETE FROM sessions WHERE ended_at IS NOT NULL AND ended_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- 테이블 최적화
OPTIMIZE TABLE sessions, health_checks, api_logs;
```

## 🔄 자동 작업

### 세션 타임아웃 처리

매 1분마다 실행되어 2분 이상 heartbeat가 없는 세션을 자동으로 종료합니다.

```typescript
// src/global/tasks/SessionTimeoutTask.ts
@Cron(CronExpression.EVERY_MINUTE)
async handleSessionTimeout() {
  // 2분 이상 heartbeat 없는 세션 종료
}
```

## 🧪 테스트

```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov
```

## 📝 코드 스타일

프로젝트는 CLAUDE.md 가이드라인을 따릅니다:

- PascalCase: 파일명, 클래스명
- camelCase: 변수명, 메서드명
- UPPER_SNAKE_CASE: 상수
- TypeScript strict mode
- No barrel exports (index.ts 금지, 예외: error codes)

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 UNLICENSED 라이선스를 따릅니다.

## 👥 제작자

EntryDSM Team

## 🙏 감사의 말

- NestJS Framework
- TypeORM
- JWT
- Swagger

---

Made with ❤️ by EntryDSM Team
