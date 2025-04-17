import { Test, TestingModule } from '@nestjs/testing';
import { FieldChainService } from './field-chain.service';

describe('FieldChainService', () => {
  let service: FieldChainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FieldChainService],
    }).compile();

    service = module.get<FieldChainService>(FieldChainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
