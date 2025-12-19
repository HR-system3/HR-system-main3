import { api } from '@/lib/axios';

export interface CompanySettings {
  payDate: number;
  timeZone: string;
  currency: string;
  _id?: string;
}

export type PayTypeStatus = "DRAFT" | "APPROVED" | "REJECTED";

export interface PayType {
  _id: string;
  type: string;
  amount: number;
  status?: PayTypeStatus;
}

export type ConfigStatus = "DRAFT" | "APPROVED" | "REJECTED" | "PENDING_MANAGER_APPROVAL";

export interface ApprovalItem {
  id: string;
  type: string;
  name: string;
  status: ConfigStatus;
  createdAt: string;
}

export const payrollConfigurationService = {
  // Company Settings
  async getCompanySettings(): Promise<CompanySettings> {
    if (process.env.NODE_ENV === 'development') {
      const fullUrl = `${api.defaults.baseURL}/payroll-configuration/company-settings`;
      console.log('[PayrollConfigService] getCompanySettings() ->', fullUrl);
    }
    const response = await api.get<CompanySettings>('/payroll-configuration/company-settings');
    return response.data;
  },

  async updateCompanySettings(settings: CompanySettings): Promise<CompanySettings> {
    if (process.env.NODE_ENV === 'development') {
      const fullUrl = `${api.defaults.baseURL}/payroll-configuration/company-settings`;
      console.log('[PayrollConfigService] updateCompanySettings() ->', fullUrl);
    }
    const response = await api.put<CompanySettings>('/payroll-configuration/company-settings', settings);
    return response.data;
  },

  // Pay Types
  async getPayTypes(): Promise<PayType[]> {
    if (process.env.NODE_ENV === 'development') {
      const fullUrl = `${api.defaults.baseURL}/payroll-configuration/pay-type`;
      console.log('[PayrollConfigService] getPayTypes() ->', fullUrl);
    }
    const response = await api.get<PayType[]>('/payroll-configuration/pay-type');
    return response.data;
  },

  async createPayType(dto: { type: string; amount: number }): Promise<PayType> {
    const response = await api.post<PayType>('/payroll-configuration/pay-type', dto);
    return response.data;
  },

  async updatePayType(id: string, dto: { type: string; amount: number }): Promise<PayType> {
    const response = await api.put<PayType>(`/payroll-configuration/pay-type/${id}`, dto);
    return response.data;
  },

  async deletePayType(id: string): Promise<void> {
    await api.delete(`/payroll-configuration/pay-type/${id}`);
  },

  // Approvals
  async getPendingApprovals(): Promise<ApprovalItem[]> {
    if (process.env.NODE_ENV === 'development') {
      const fullUrl = `${api.defaults.baseURL}/payroll-configuration/approvals/pending`;
      console.log('[PayrollConfigService] getPendingApprovals() ->', fullUrl);
    }
    const response = await api.get<ApprovalItem[]>('/payroll-configuration/approvals/pending');
    return response.data;
  },

  async approveRequest(dto: { id: string; type: string }): Promise<any> {
    const response = await api.post('/payroll-configuration/approvals/approve', dto);
    return response.data;
  },

  async rejectRequest(dto: { id: string; type: string }): Promise<any> {
    const response = await api.post('/payroll-configuration/approvals/reject', dto);
    return response.data;
  },
};
