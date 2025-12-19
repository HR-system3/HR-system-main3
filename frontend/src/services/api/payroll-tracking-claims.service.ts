import api from '@/lib/axios';
import { Claim } from '@/types/payroll-tracking-claim.types';

// Mock data fallback
const mockClaims: Claim[] = [];

export const PayrollTrackingClaimsService = {
  // ================= EMPLOYEE =================
  getEmployeeClaims(employeeId: string) {
    return api.get<Claim[]>(
      `/payroll-tracking/claims/employee/${employeeId}`
    ).catch(() => ({ data: mockClaims } as any));
  },

  createClaim(data: {
    employeeId: string;
    description: string;
    claimType: string;
    amount: number;
  }) {
    return api.post<Claim>(`/payroll-tracking/claims`, data).catch((error) => {
      console.error('Failed to create claim:', error);
      throw error;
    });
  },

  // ================= PAYROLL =================
  getAllClaims() {
    return api.get<Claim[]>(`/payroll-tracking/claims`).catch(() => ({ data: mockClaims } as any));
  },

  approveClaim(
    claimId: string,
    data: {
      financeStaffId: string;
      approvedAmount: number;
      resolutionComment?: string;
    }
  ) {
    return api.patch<Claim>(
      `/payroll-tracking/claims/${claimId}/approve`,
      data
    );
  },

  rejectClaim(
    claimId: string,
    data: {
      financeStaffId: string;
      rejectionReason: string;
      resolutionComment?: string;
    }
  ) {
    return api.patch<Claim>(
      `/payroll-tracking/claims/${claimId}/reject`,
      data
    );
  },
};
