import api from '@/lib/axios';
import { Benefit } from '@/types/benefit.types';

export const BenefitsService = {
  getResignationBenefits: () => 
    api.get<{ success: boolean; benefits: Benefit[] }>(`/payroll-execution/resignation-benefits`),
  
  getTerminationBenefits: () => 
    api.get<{ success: boolean; benefits: Benefit[] }>(`/payroll-execution/termination-benefits`),
  
  approve: (id: string, payload: { approvedBy: string; notes?: string }) => 
    api.post(`/payroll-execution/resignation-benefits/approve/${id}`, {}),
  
  reject: (id: string, payload: { approvedBy: string; rejectionReason: string }) => 
    api.post(`/payroll-execution/benefits/${id}/reject`, payload),
  
  create: (data: Partial<Benefit>) => 
    api.post<Benefit>(`/payroll-execution/benefits`, data),
  
  update: (id: string, data: Partial<Benefit>) => 
    api.put<Benefit>(`/payroll-execution/benefits/${id}`, data),
};
