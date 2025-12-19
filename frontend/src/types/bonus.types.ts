export type BonusStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export interface SigningBonus {
  _id: string;
  employeeId: string;
  employeeName?: string;
  amount: number;
  status: BonusStatus;
  approvedBy?: string;
  approvedAt?: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
