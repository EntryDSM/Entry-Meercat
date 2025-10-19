import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientError } from './entity/ClientError.entity';
import { ServerError } from './entity/ServerError.entity';
import { CriticalError } from './entity/CriticalError.entity';
import { ErrorService } from './service/ErrorService';
import { ErrorController } from './presentation/ErrorController';
import { WebhookService } from '../../global/services/WebhookService';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClientError, ServerError, CriticalError]),
  ],
  controllers: [ErrorController],
  providers: [ErrorService, WebhookService],
  exports: [ErrorService],
})
export class ErrorModule {}
