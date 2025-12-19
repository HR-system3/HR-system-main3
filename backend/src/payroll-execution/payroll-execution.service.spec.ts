import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PayrollExecutionService } from './payroll-execution.service';
import { employeePayrollDetails } from './models/employeePayrollDetails.schema';
import { EmployeeProfile } from '../employee-profile/models/employee-profile.schema';
import { allowance } from '../payroll-configuration/models/allowance.schema';
import { payGrade } from '../payroll-configuration/models/payGrades.schema';
import { payrollRuns } from './models/payrollRuns.schema';
import { taxRules } from '../payroll-configuration/models/taxRules.schema';
import { insuranceBrackets } from '../payroll-configuration/models/insuranceBrackets.schema';
import { paySlip } from './models/payslip.schema';
import { employeeSigningBonus } from './models/EmployeeSigningBonus.schema';
import { terminationAndResignationBenefits } from '../payroll-configuration/models/terminationAndResignationBenefits';

describe('PayrollExecutionService', () => {
  let service: PayrollExecutionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollExecutionService,
        { provide: getModelToken(employeePayrollDetails.name), useValue: {} },
        { provide: getModelToken(EmployeeProfile.name), useValue: {} },
        { provide: getModelToken(allowance.name), useValue: {} },
        { provide: getModelToken(payGrade.name), useValue: {} },
        { provide: getModelToken(payrollRuns.name), useValue: {} },
        { provide: getModelToken(taxRules.name), useValue: {} },
        { provide: getModelToken(insuranceBrackets.name), useValue: {} },
        { provide: getModelToken(paySlip.name), useValue: {} },
        { provide: getModelToken(employeeSigningBonus.name), useValue: {} },
        // same model injected twice in service constructor
        { provide: getModelToken(terminationAndResignationBenefits.name), useValue: {} },
      ],
    }).compile();

    service = module.get<PayrollExecutionService>(PayrollExecutionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
