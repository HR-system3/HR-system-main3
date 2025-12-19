import api from '@/lib/axios';
import { Irregularity } from '@/types/irregularity.types';

export const IrregularityService = {
  listByRun: (runId: string) => 
    api.get<{ success: boolean; irregularities: Irregularity[] }>(`/payroll-execution/runs/${runId}/irregularities`),
  
  resolve: (runId: string, payload: { managerId: string; resolvedDetails: { employeeId: string; resolutionNote: string }[] }) => 
    api.post(`/payroll-execution/runs/${runId}/resolve-irregularities`, payload),
  
  getAll: () => 
    api.get<{ success: boolean; irregularities: Irregularity[] }>(`/payroll-execution/irregularities`),
};
