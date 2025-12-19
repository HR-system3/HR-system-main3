export enum PayRollStatus {
  DRAFT = "draft",
  UNDER_REVIEW = "under review",
  PENDING_FINANCE_APPROVAL = "pending finance approval",
  APPROVED = "approved",
  REJECTED = "rejected",
  LOCKED = "locked",
  UNLOCKED = "unlocked",
}

export enum PayRollPaymentStatus {
  PENDING = "pending",
  PAID = "paid",
}

export interface PayrollRun {
  _id: string;
  runId: string;
  payrollPeriod: string;

  status: PayRollStatus;
  paymentStatus: PayRollPaymentStatus;

  entity: string;
  employees: number;
  exceptions: number;
  totalnetpay: number;

  payrollSpecialistId: string;
  payrollManagerId?: string;
  financeStaffId?: string;

  createdAt: string;
  updatedAt: string;

  runName?: string;
}

export interface PayrollPreviewTotals {
  totalAllowances: number;
  totalDeductions: number;
  totalNetPay: number;
}

export interface PayrollPreviewIrregularity {
  employeeId: string | { _id: string; employeeNumber?: string; workEmail?: string };
  employee?: { _id: string; employeeNumber?: string; workEmail?: string; firstName?: string; lastName?: string };
  issue: string;
  bankStatus?: string;
  netPay?: number;
}

export interface PayrollDetailPreview {
  _id: string;
  employeeId: string | { _id: string; employeeNumber?: string; workEmail?: string; firstName?: string; lastName?: string };
  allowances: number;
  deductions: number;
  netSalary: number;
  netPay: number;
  bankStatus: string;
  exceptions?: string | null;
  issues?: string[];
  canFinalize: boolean;
}

export interface PayrollPreview {
  run: PayrollRun;
  totals: PayrollPreviewTotals;
  payrollDetails: PayrollDetailPreview[];
  irregularities: PayrollPreviewIrregularity[];
  canFinalizeRun: boolean;
}

export interface Payslip {
  _id: string;
  employeeId: { _id: string; employeeNumber?: string; firstName?: string; lastName?: string; workEmail?: string } | string;
  payrollRunId: string;
  earningsDetails?: {
    baseSalary?: number;
    allowances?: { name?: string; amount?: number }[];
    bonuses?: { name?: string; amount?: number }[];
    benefits?: { name?: string; amount?: number }[];
    refunds?: { description?: string; amount?: number }[];
  };
  deductionsDetails?: {
    taxes?: { name?: string; rate?: number; amount?: number }[];
    insurances?: { name?: string; employeeRate?: number; amount?: number }[];
    penalties?: { reason?: string; amount?: number };
  };
  totalGrossSalary: number;
  totaDeductions?: number;
  netPay: number;
  paymentStatus: string;
  createdAt?: string;
}
