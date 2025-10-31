import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { SubmissionEvent } from './entity/SubmissionEvent.entity';
import { SubmissionCommandService } from './service/SubmissionCommandService';
import { SubmissionController } from './presentation/SubmissionController';
import { RecordSubmissionSuccessHandler } from './command/handler/RecordSubmissionSuccessHandler';
import { RecordSubmissionCancelHandler } from './command/handler/RecordSubmissionCancelHandler';
import { RecordCancelSuccessHandler } from './command/handler/RecordCancelSuccessHandler';
import { RecordCancelCancelHandler } from './command/handler/RecordCancelCancelHandler';

const commandHandlers = [
  RecordSubmissionSuccessHandler,
  RecordSubmissionCancelHandler,
  RecordCancelSuccessHandler,
  RecordCancelCancelHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([SubmissionEvent]),
  ],
  controllers: [SubmissionController],
  providers: [SubmissionCommandService, ...commandHandlers],
  exports: [SubmissionCommandService],
})
export class SubmissionModule {}
