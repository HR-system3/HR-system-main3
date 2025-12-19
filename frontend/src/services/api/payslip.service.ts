import api from '@/lib/axios';
import { Payslip } from '@/types/payroll-run.types';

export const payslipService = {
  getPayslipsByRun: async (runId: string): Promise<Payslip[]> => {
    const res = await api.get(`/payroll-execution/runs/${encodeURIComponent(runId)}/payslips`);
    return res.data.payslips ?? [];
  },
};