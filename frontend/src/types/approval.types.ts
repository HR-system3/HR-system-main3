export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Approval {
  _id: string;
  runId: string;
  approverId: string;
  approverName?: string;
  approverRole: 'manager' | 'finance' | 'payroll';
  status: ApprovalStatus;
  comments?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}
