export enum PayrollStatus {
  DRAFT = 'DRAFT',
  CALCULATED = 'CALCULATED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
  UNDER_REVIEW = 'UNDER_REVIEW',
  PENDING_FINANCE_APPROVAL = 'PENDING_FINANCE_APPROVAL',
  LOCKED = 'LOCKED',
  UNLOCKED = 'UNLOCKED',
}

export enum PayrollPaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

export type IrregularitySeverity = 'low' | 'medium' | 'high' | 'critical';
