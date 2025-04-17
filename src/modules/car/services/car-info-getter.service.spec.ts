import { Test, TestingModule } from '@nestjs/testing';
import { CarInfoGetterService } from './car-info-getter.service';

describe('CarInfoGetterService', () => {
  let service: CarInfoGetterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarInfoGetterService],
    }).compile();

    service = module.get<CarInfoGetterService>(CarInfoGetterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
