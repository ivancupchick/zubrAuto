import { Test, TestingModule } from '@nestjs/testing';
import { PhoneCallController } from './phone-call.controller';
import { PhoneCallService } from './phone-call.service';

describe('PhoneCallController', () => {
  let controller: PhoneCallController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhoneCallController],
      providers: [PhoneCallService],
    }).compile();

    controller = module.get<PhoneCallController>(PhoneCallController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
