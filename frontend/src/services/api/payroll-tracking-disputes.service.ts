import api from '@/lib/axios';
import { Dispute } from '@/types/payroll-tracking-dispute.types';

// Mock data fallback
const mockDisputes: Dispute[] = [];

export const PayrollTrackingDisputesService = {
  // ================= EMPLOYEE =================
  getEmployeeDisputes(employeeId: string) {
    return api.get<Dispute[]>(
      `/payroll-tracking/disputes/employee/${employeeId}`
    ).catch(() => ({ data: mockDisputes } as any));
  },

  createDispute(data: {
    employeeId: string;
    payslipId: string;
    description: string;
  }) {
    return api.post<Dispute>(`/payroll-tracking/disputes`, data).catch((error) => {
      console.error('Failed to create dispute:', error);
      throw error;
    });
  },

  // ================= PAYROLL =================
  getAllDisputes() {
    return api.get<Dispute[]>(`/payroll-tracking/disputes`).catch(() => ({ data: mockDisputes } as any));
  },

  approveDispute(
    disputeId: string,
    data: {
      financeStaffId: string;
      resolutionComment?: string;
    }
  ) {
    return api.patch<Dispute>(
      `/payroll-tracking/disputes/${disputeId}/approve`,
      data
    );
  },

  rejectDispute(
    disputeId: string,
    data: {
      financeStaffId: string;
      rejectionReason: string;
      resolutionComment?: string;
    }
  ) {
    return api.patch<Dispute>(
      `/payroll-tracking/disputes/${disputeId}/reject`,
      data
    );
  },
};
