export type DisputeStatus = "under review" | "approved" | "rejected";

export interface Dispute {
  _id: string;
  disputeId: string;
  description: string;
  employeeId: string;
  payslipId: string;
  financeStaffId?: string;
  status: DisputeStatus;
  rejectionReason?: string;
  resolutionComment?: string;
  createdAt: string;
  updatedAt: string;
}
