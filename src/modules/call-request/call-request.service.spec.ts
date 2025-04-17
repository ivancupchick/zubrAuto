import { Test, TestingModule } from '@nestjs/testing';
import { CallRequestService } from './call-request.service';

describe('CallRequestService', () => {
  let service: CallRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CallRequestService],
    }).compile();

    service = module.get<CallRequestService>(CallRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
