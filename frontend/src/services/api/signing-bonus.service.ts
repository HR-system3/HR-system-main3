import api from '@/lib/axios';
import { SigningBonus } from '@/types/bonus.types';

export const SigningBonusService = {
  getAll: () => 
    api.get<{ success: boolean; bonuses: SigningBonus[] }>(`/payroll-execution/signing-bonuses`),
  
  approve: (id: string, payload: { approvedBy: string; notes?: string; payrollRunId?: string }) => 
    api.post(`/payroll-execution/signing-bonus/approve/${id}?payrollRunId=${payload.payrollRunId || payload.approvedBy}`, {}),
  
  reject: (id: string, payload: { approvedBy: string; rejectionReason: string }) => 
    api.post(`/payroll-execution/signing-bonuses/${id}/reject`, payload),
  
  create: (data: Partial<SigningBonus>) => 
    api.post<SigningBonus>(`/payroll-execution/signing-bonuses`, data),
  
  update: (id: string, data: Partial<SigningBonus>) => 
    api.patch<SigningBonus>(`/payroll-execution/signing-bonus/edit/${id}`, data),
};
