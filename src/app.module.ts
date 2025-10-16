import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './global/filters/HttpExceptionFilter';
import { SessionTimeoutTask } from './global/tasks/SessionTimeoutTask';
import { AuthModule } from './domain/auth/AuthModule';
import { SessionModule } from './domain/session/SessionModule';
import { MonitoringModule } from './domain/monitoring/MonitoringModule';
import { ErrorModule } from './domain/error/ErrorModule';
import { SubmissionModule } from './domain/submission/SubmissionModule';
import { PdfModule } from './domain/pdf/PdfModule';
import { NetworkModule } from './domain/network/NetworkModule';
import { DashboardModule } from './domain/dashboard/DashboardModule';
import { Session } from './domain/session/entity/Session.entity';
import { Admin } from './domain/auth/entity/Admin.entity';
import { HealthCheck } from './domain/monitoring/entity/HealthCheck.entity';
import { ApiLog } from './domain/monitoring/entity/ApiLog.entity';
import { ClientError } from './domain/error/entity/ClientError.entity';
import { ServerError } from './domain/error/entity/ServerError.entity';
import { CriticalError } from './domain/error/entity/CriticalError.entity';
import { SubmissionSession } from './domain/submission/entity/SubmissionSession.entity';
import { SubmissionCancellation } from './domain/submission/entity/SubmissionCancellation.entity';
import { PdfOperation } from './domain/pdf/entity/PdfOperation.entity';
import { NetworkTest } from './domain/network/entity/NetworkTest.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'entrydsm_apm',
      entities: [
        Session,
        Admin,
        HealthCheck,
        ApiLog,
        ClientError,
        ServerError,
        CriticalError,
        SubmissionSession,
        SubmissionCancellation,
        PdfOperation,
        NetworkTest,
      ],
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([Session]),
    ScheduleModule.forRoot(),
    AuthModule,
    SessionModule,
    MonitoringModule,
    ErrorModule,
    SubmissionModule,
    PdfModule,
    NetworkModule,
    DashboardModule,
  ],
  providers: [
    SessionTimeoutTask,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
