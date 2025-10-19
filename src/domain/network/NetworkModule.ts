import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetworkTest } from './entity/NetworkTest.entity';
import { NetworkController } from './presentation/NetworkController';
import { NetworkService } from './service/NetworkService';

@Module({
  imports: [TypeOrmModule.forFeature([NetworkTest])],
  controllers: [NetworkController],
  providers: [NetworkService],
  exports: [NetworkService],
})
export class NetworkModule {}
