import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NetworkTest } from '../entity/NetworkTest.entity';
import { NetworkTestRequest } from '../presentation/dto/request/NetworkTestRequest';

@Injectable()
export class NetworkService {
  constructor(
    @InjectRepository(NetworkTest)
    private readonly networkTestRepository: Repository<NetworkTest>,
  ) {}

  /**
   * 네트워크 테스트 결과 기록
   * @description
   * - 네트워크 속도, 지연시간, 패킷 손실 등 테스트 결과를 데이터베이스에 저장
   * - 연결 타입 및 품질 평가 기록
   * @param request - 네트워크 테스트 요청
   * @returns Promise<void>
   */
  async recordNetworkTest(request: NetworkTestRequest): Promise<void> {
    const networkTest = NetworkTest.create(
      request.sessionId,
      request.latency,
      request.downloadSpeed,
      request.uploadSpeed,
      request.jitter,
      request.packetLoss,
      request.connectionType,
      request.qualityRating,
    );
    await this.networkTestRepository.save(networkTest);
  }
}
