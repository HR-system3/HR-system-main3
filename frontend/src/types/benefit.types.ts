export type BenefitStatus = 'pending' | 'approved' | 'rejected' | 'paid';
export type BenefitType = 'resignation' | 'termination';

export interface Benefit {
  _id: string;
  employeeId: string;
  employeeName?: string;
  type: BenefitType;
  amount: number;
  status: BenefitStatus;
  approvedBy?: string;
  approvedAt?: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
