import { PayrollPaymentStatus } from './enums';

export interface Payslip {
  id: string;
  employeeId: string;
  employeeName?: string;
  runId: string;
  netPay: number;
  status: PayrollPaymentStatus | string;
  issuedAt?: string;
  totalGrossSalary?: number;
  totalDeductions?: number;
  paymentStatus?: string;
}
