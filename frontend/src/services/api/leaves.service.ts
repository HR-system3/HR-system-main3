import { api } from '@/lib/axios';

// Types (minimal - can be expanded later)
export interface LeaveBalance {
  leaveTypeId: string;
  entitlementDays: number;
  usedDays: number;
  adjustmentTotal: number;
  remaining: number;
}

export interface LeaveRequest {
  _id: string;
  employeeId: string;
  leaveTypeId: any;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
  justification?: string;
  createdAt: string;
  [key: string]: any;
}

export interface LeaveType {
  _id: string;
  name: string;
  code: string;
  [key: string]: any;
}

export interface IrregularPattern {
  employeeId: string;
  employeeName: string;
  pattern: string;
  frequency: number;
  [key: string]: any;
}

export const leavesService = {
  // Employee endpoints
  async getEmployeeBalance(): Promise<LeaveBalance[]> {
    // TEMP debug logging in dev
    if (process.env.NODE_ENV === 'development') {
      const fullUrl = `${api.defaults.baseURL}/leaves/employee/balance`;
      console.log('[LeavesService] getEmployeeBalance() ->', fullUrl);
    }
    const response = await api.get<LeaveBalance[]>('/leaves/employee/balance');
    return response.data;
  },

  async getEmployeeHistory(): Promise<LeaveRequest[]> {
    const response = await api.get<LeaveRequest[]>('/leaves/employee/history');
    return response.data;
  },

  async createLeaveRequest(dto: any): Promise<LeaveRequest> {
    const response = await api.post<LeaveRequest>('/leaves/employee', dto);
    return response.data;
  },

  async updateLeaveRequest(id: string, dto: any): Promise<LeaveRequest> {
    const response = await api.patch<LeaveRequest>(`/leaves/employee/${id}`, dto);
    return response.data;
  },

  async cancelLeaveRequest(id: string): Promise<void> {
    await api.delete(`/leaves/employee/${id}`);
  },

  async validateLeaveRequest(dto: any): Promise<any> {
    const response = await api.post('/leaves/employee/validate', dto);
    return response.data;
  },

  async getRequestTimeline(id: string): Promise<any> {
    const response = await api.get(`/leaves/employee/requests/${id}/timeline`);
    return response.data;
  },

  // Manager endpoints
  async getManagerRequests(): Promise<LeaveRequest[]> {
    if (process.env.NODE_ENV === 'development') {
      const fullUrl = `${api.defaults.baseURL}/leaves/manager/requests`;
      console.log('[LeavesService] getManagerRequests() ->', fullUrl);
    }
    const response = await api.get<LeaveRequest[]>('/leaves/manager/requests');
    return response.data;
  },

  async approveRejectRequest(id: string, dto: any): Promise<LeaveRequest> {
    const response = await api.post<LeaveRequest>(`/leaves/manager/requests/${id}/decision`, dto);
    return response.data;
  },

  async getManagerDelegations(): Promise<any[]> {
    const response = await api.get('/leaves/manager/delegations');
    return response.data;
  },

  async createDelegation(dto: any): Promise<any> {
    const response = await api.post('/leaves/manager/delegations', dto);
    return response.data;
  },

  async getManagerRequestTimeline(id: string): Promise<any> {
    const response = await api.get(`/leaves/manager/requests/${id}/timeline`);
    return response.data;
  },

  // HR endpoints
  async getHrTypes(): Promise<LeaveType[]> {
    if (process.env.NODE_ENV === 'development') {
      const fullUrl = `${api.defaults.baseURL}/leaves/hr/types`;
      console.log('[LeavesService] getHrTypes() ->', fullUrl);
    }
    const response = await api.get<LeaveType[]>('/leaves/hr/types');
    return response.data;
  },

  async createLeaveType(dto: any): Promise<LeaveType> {
    const response = await api.post<LeaveType>('/leaves/hr/types', dto);
    return response.data;
  },

  async updateLeaveType(id: string, dto: any): Promise<LeaveType> {
    const response = await api.patch<LeaveType>(`/leaves/hr/types/${id}`, dto);
    return response.data;
  },

  async deleteLeaveType(id: string): Promise<void> {
    await api.delete(`/leaves/hr/types/${id}`);
  },

  async getHrRequests(query?: any): Promise<LeaveRequest[]> {
    const response = await api.get<LeaveRequest[]>('/leaves/hr/requests', { params: query });
    return response.data;
  },

  async finalizeRequest(id: string, dto: any): Promise<LeaveRequest> {
    const response = await api.post<LeaveRequest>(`/leaves/hr/requests/${id}/finalize`, dto);
    return response.data;
  },

  async overrideDecision(id: string, dto: any): Promise<LeaveRequest> {
    const response = await api.post<LeaveRequest>(`/leaves/hr/requests/${id}/override`, dto);
    return response.data;
  },

  async getHrPatternsReport(employeeId?: string): Promise<IrregularPattern[]> {
    if (process.env.NODE_ENV === 'development') {
      const fullUrl = `${api.defaults.baseURL}/leaves/hr/reports/patterns`;
      console.log('[LeavesService] getHrPatternsReport() ->', fullUrl);
    }
    const response = await api.get<IrregularPattern[]>('/leaves/hr/reports/patterns', {
      params: employeeId ? { employeeId } : undefined,
    });
    return response.data;
  },

  async getHrOverview(): Promise<any> {
    if (process.env.NODE_ENV === 'development') {
      const fullUrl = `${api.defaults.baseURL}/leaves/hr/overview`;
      console.log('[LeavesService] getHrOverview() ->', fullUrl);
    }
    const response = await api.get('/leaves/hr/overview');
    return response.data;
  },

  async getEntitlements(): Promise<any[]> {
    const response = await api.get('/leaves/hr/entitlements');
    return response.data;
  },

  async configureEntitlement(dto: any): Promise<any> {
    const response = await api.post('/leaves/hr/entitlements', dto);
    return response.data;
  },

  async getApprovalWorkflows(): Promise<any[]> {
    const response = await api.get('/leaves/hr/workflows');
    return response.data;
  },

  async getAccrualConfig(): Promise<any> {
    const response = await api.get('/leaves/hr/accrual');
    return response.data;
  },

  async configureAccrual(dto: any): Promise<any> {
    const response = await api.post('/leaves/hr/accrual', dto);
    return response.data;
  },

  async getHolidays(): Promise<any[]> {
    const response = await api.get('/leaves/hr/holidays');
    return response.data;
  },

  async getCalendars(): Promise<any[]> {
    const response = await api.get('/leaves/hr/calendars');
    return response.data;
  },

  async createCalendar(dto: any): Promise<any> {
    const response = await api.post('/leaves/hr/calendars', dto);
    return response.data;
  },

  async getAuditLogs(query?: any): Promise<any[]> {
    const response = await api.get('/leaves/hr/audit-logs', { params: query });
    return response.data;
  },

  async manualAdjustment(dto: any): Promise<any> {
    const response = await api.post('/leaves/hr/adjustments', dto);
    return response.data;
  },
};
