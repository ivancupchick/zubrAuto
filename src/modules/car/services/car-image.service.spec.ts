import { Test, TestingModule } from '@nestjs/testing';
import { CarImageService } from './car-image.service';

describe('CarImageService', () => {
  let service: CarImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarImageService],
    }).compile();

    service = module.get<CarImageService>(CarImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
