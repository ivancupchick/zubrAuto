import { Test, TestingModule } from '@nestjs/testing';
import { PhoneCallService } from './phone-call.service';

describe('PhoneCallService', () => {
  let service: PhoneCallService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhoneCallService],
    }).compile();

    service = module.get<PhoneCallService>(PhoneCallService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
