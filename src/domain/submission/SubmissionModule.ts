import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionSession } from './entity/SubmissionSession.entity';
import { SubmissionCancellation } from './entity/SubmissionCancellation.entity';
import { SubmissionService } from './service/SubmissionService';
import { SubmissionController } from './presentation/SubmissionController';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubmissionSession, SubmissionCancellation]),
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
  exports: [SubmissionService],
})
export class SubmissionModule {}
