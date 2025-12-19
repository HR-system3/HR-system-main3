import api from '@/lib/axios';
import { Approval } from '@/types/approval.types';

export const ApprovalService = {
  getByRun: (runId: string) => 
    api.get<Approval[]>(`/payroll-execution/runs/${runId}/approvals`),
  
  approveByManager: (runId: string, payload: { managerId: string; comments?: string }) => 
    api.post(`/payroll-execution/runs/${runId}/approve-manager`, payload),
  
  approveByFinance: (runId: string, payload: { financeStaffId: string; comments?: string }) => 
    api.post(`/payroll-execution/runs/${runId}/approve-finance`, payload),
  
  sendForApproval: (runId: string, payload: { managerId: string; financeStaffId: string }) => 
    api.post(`/payroll-execution/runs/${runId}/send-for-approval`, payload),
};
