import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AuthService } from './domain/auth/service/AuthService';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // 관리자 계정 초기화
    await initializeAdminAccount(app);

    // CORS 설정
    app.enableCors({
        origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true,
    });

    // 글로벌 검증 파이프
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // Swagger 설정
    const config = new DocumentBuilder()
        .setTitle('Entry Meercat APM API')
        .setDescription('EntryDSM Application Performance Monitoring API Documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('auth', '관리자 인증')
        .addTag('session', '세션 관리')
        .addTag('monitoring', '모니터링 (Health Check, API Logs)')
        .addTag('error', '에러 추적')
        .addTag('submission', '원서 제출')
        .addTag('pdf', 'PDF 작업')
        .addTag('network', '네트워크 테스트')
        .addTag('dashboard', '대시보드 (Admin Only)')
        .addTag('health', 'Health Check')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`
    Entry Meercat APM Server is running on: http://localhost:${port}
    Swagger API Documentation: http://localhost:${port}/api
  `);
}

/**
 * 관리자 계정 초기화
 *
 * @description
 * - 환경변수의 ADMIN_USERNAME, ADMIN_PASSWORD로 관리자 계정 생성
 * - 이미 존재하면 생성하지 않음
 * - 앱 시작 시 자동 실행
 */
async function initializeAdminAccount(app: INestApplication): Promise<void> {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !password) {
        console.warn('ADMIN_USERNAME 또는 ADMIN_PASSWORD 환경변수가 설정되지 않아 관리자 계정 초기화를 건너뜁니다.');
        return;
    }

    const authService = app.get(AuthService);

    try {
        const existingAdmin = await authService.findAdminByUsername(username);
        if (!existingAdmin) {
            await authService.createAdmin(username, password);
            console.log(`관리자 계정이 생성되었습니다: ${username}`);
        } else {
            console.log(`관리자 계정이 이미 존재합니다: ${username}`);
        }
    } catch (error) {
        console.error('관리자 계정 초기화 실패:', error instanceof Error ? error.message : String(error));
    }
}

bootstrap();