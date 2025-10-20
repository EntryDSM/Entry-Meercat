import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionEvent } from './entity/SubmissionEvent.entity';
import { SubmissionService } from './service/SubmissionService';
import { SubmissionController } from './presentation/SubmissionController';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubmissionEvent]),
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
  exports: [SubmissionService],
})
export class SubmissionModule {}
