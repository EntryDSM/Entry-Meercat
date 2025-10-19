import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PdfOperation } from './entity/PdfOperation.entity';
import { PdfController } from './presentation/PdfController';
import { PdfService } from './service/PdfService';

@Module({
  imports: [TypeOrmModule.forFeature([PdfOperation])],
  controllers: [PdfController],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}
