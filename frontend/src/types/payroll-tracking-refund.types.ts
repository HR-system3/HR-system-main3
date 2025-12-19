export type RefundStatus = "pending" | "paid";

export interface RefundDetails {
  description: string;
  amount: number;
}

export interface Refund {
  _id: string;
  claimId?: string;
  disputeId?: string;
  refundDetails: RefundDetails;
  employeeId: string;
  financeStaffId?: string;
  status: RefundStatus;
  paidInPayrollRunId?: string;
  createdAt: string;
  updatedAt: string;
}