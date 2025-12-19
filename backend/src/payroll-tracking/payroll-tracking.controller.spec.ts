import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PayrollTrackingController } from './payroll-tracking.controller';
import { PayrollTrackingService } from './payroll-tracking.service';
import { Claim } from './models/claims.schema';

describe('PayrollTrackingController', () => {
  let controller: PayrollTrackingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollTrackingController],
      providers: [
        PayrollTrackingService,
        { provide: getModelToken(Claim.name), useValue: {} },
      ],
    }).compile();

    controller = module.get<PayrollTrackingController>(PayrollTrackingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
