import api from '@/lib/axios';
import { PayrollCalculation } from '@/types/payroll-calculation.types';

export const CalculationService = {
  getByRun: (runId: string) => 
    api.get<PayrollCalculation>(`/payroll-execution/runs/${runId}/calculations`),
  
  recalculate: (runId: string) => 
    api.post(`/payroll-execution/runs/${runId}/recalculate`),
};
