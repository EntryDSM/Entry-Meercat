import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthCheck } from './entity/HealthCheck.entity';
import { ApiLog } from './entity/ApiLog.entity';
import { Session } from '../session/entity/Session.entity';
import { MonitoringService } from './service/MonitoringService';
import { MonitoringController } from './presentation/MonitoringController';

@Module({
  imports: [TypeOrmModule.forFeature([HealthCheck, ApiLog, Session])],
  controllers: [MonitoringController],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
