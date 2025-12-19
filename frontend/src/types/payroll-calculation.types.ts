export interface SalaryComponent {
  name: string;
  amount: number;
  type: 'allowance' | 'deduction' | 'tax' | 'insurance';
}

export interface CalculationDetail {
  employeeId: string;
  employeeName?: string;
  baseSalary: number;
  allowances: SalaryComponent[];
  deductions: SalaryComponent[];
  taxes: SalaryComponent[];
  insurances: SalaryComponent[];
  totalGross: number;
  totalDeductions: number;
  netPay: number;
  prorationFactor?: number;
  prorationReason?: string;
}

export interface PayrollCalculation {
  runId: string;
  calculations: CalculationDetail[];
  totals: {
    totalGross: number;
    totalDeductions: number;
    totalNetPay: number;
  };
  calculatedAt: string;
}
