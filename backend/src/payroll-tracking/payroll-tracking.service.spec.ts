import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PayrollTrackingService } from './payroll-tracking.service';
import { Claim } from './models/claims.schema';

describe('PayrollTrackingService', () => {
  let service: PayrollTrackingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollTrackingService,
        { provide: getModelToken(Claim.name), useValue: {} },
      ],
    }).compile();

    service = module.get<PayrollTrackingService>(PayrollTrackingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
