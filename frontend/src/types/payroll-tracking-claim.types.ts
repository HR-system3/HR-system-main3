export type ClaimStatus = "under review" | "approved" | "rejected";

export interface Claim {
  _id: string;
  claimId: string;
  description: string;
  claimType: string;
  employeeId: string;
  financeStaffId?: string;
  amount: number;
  approvedAmount?: number;
  status: ClaimStatus;
  rejectionReason?: string;
  resolutionComment?: string;
  createdAt: string;
  updatedAt: string;
}
