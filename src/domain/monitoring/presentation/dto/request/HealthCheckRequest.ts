import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PageType } from '../../../../session/entity/Session.entity';

export class PageDto {
  @ApiProperty({ description: '페이지 URL', example: '/apply/step2' })
  @IsString()
  url: string;

  @ApiProperty({ description: '페이지 제목', example: '원서접수 2단계' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'DOM 로드 시간(ms)', example: 245 })
  @IsNumber()
  domLoadTime: number;

  @ApiProperty({ description: '페이지 로드 시간(ms)', example: 567 })
  @IsNumber()
  pageLoadTime: number;
}

export class PerformanceDto {
  @ApiProperty({ description: '메모리 사용량(MB)', example: 45.2 })
  @IsNumber()
  memoryUsage: number;

  @ApiProperty({ description: '연결 타입', example: 'wifi' })
  @IsString()
  connectionType: string;
}

export class HealthCheckRequest {
  @ApiProperty({ description: '세션 ID', example: 'uuid-string' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    description: '페이지 타입',
    enum: PageType,
    example: PageType.USER,
  })
  @IsEnum(PageType)
  pageType: PageType;

  @ApiProperty({ description: '페이지 정보', type: PageDto })
  @ValidateNested()
  @Type(() => PageDto)
  page: PageDto;

  @ApiProperty({ description: '성능 정보', type: PerformanceDto })
  @ValidateNested()
  @Type(() => PerformanceDto)
  performance: PerformanceDto;
}
