import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { Session } from './entity/Session.entity';
import { SessionCommandService } from './service/SessionCommandService';
import { SessionController } from './presentation/SessionController';
import { StartSessionHandler } from './command/handler/StartSessionHandler';
import { UpdateStatusHandler } from './command/handler/UpdateStatusHandler';
import { EndSessionHandler } from './command/handler/EndSessionHandler';

const CommandHandlers = [StartSessionHandler, UpdateStatusHandler, EndSessionHandler];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Session])],
  controllers: [SessionController],
  providers: [SessionCommandService, ...CommandHandlers],
})
export class SessionModule {}
