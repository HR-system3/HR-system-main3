import api from '@/lib/axios';
import { Refund } from '@/types/payroll-tracking-refund.types';

// Mock data fallback
const mockRefunds: Refund[] = [];

export const PayrollTrackingRefundsService = {
  // ================= EMPLOYEE =================
  getEmployeeRefunds(employeeId: string) {
    return api.get<Refund[]>(
      `/payroll-tracking/refunds/employee/${employeeId}`
    ).catch(() => ({ data: mockRefunds } as any));
  },

  // ================= FINANCE =================
  getAllRefunds() {
    return api.get<Refund[]>(`/payroll-tracking/refunds`).catch(() => ({ data: mockRefunds } as any));
  },

  createRefund(data: {
    employeeId: string;
    refundDetails: {
      description: string;
      amount: number;
    };
    claimId?: string;
    disputeId?: string;
    financeStaffId?: string;
  }) {
    return api.post<Refund>(`/payroll-tracking/refunds`, data);
  },

  markRefundPaid(
    refundId: string,
    data: {
      financeStaffId: string;
      paidInPayrollRunId: string;
    }
  ) {
    return api.patch<Refund>(
      `/payroll-tracking/refunds/${refundId}/paid`,
      data
    );
  },
};
