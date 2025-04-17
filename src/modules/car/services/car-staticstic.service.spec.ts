import { Test, TestingModule } from '@nestjs/testing';
import { CarStatisticService } from './car-statistic.service';

describe('CarStaticsticService', () => {
  let service: CarStatisticService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarStatisticService],
    }).compile();

    service = module.get<CarStatisticService>(CarStatisticService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
