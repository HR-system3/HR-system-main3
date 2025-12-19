import api from '@/lib/axios';

// Job Templates
export interface JobTemplate {
  _id: string;
  title: string;
  department: string;
  qualifications: string[];
  skills: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const JobTemplatesService = {
  getAll: async () => {
    return api.get<JobTemplate[]>('/recruitment/job-templates');
  },
  getById: async (id: string) => {
    return api.get<JobTemplate>(`/recruitment/job-templates/${id}`);
  },
  create: async (data: Partial<JobTemplate>) => {
    return api.post('/recruitment/job-templates', data);
  },
  update: async (id: string, data: Partial<JobTemplate>) => {
    return api.put(`/recruitment/job-templates/${id}`, data);
  },
  delete: async (id: string) => {
    return api.delete(`/recruitment/job-templates/${id}`);
  },
};

// Interviews
export interface Interview {
  _id: string;
  applicationId: string;
  stage: string;
  scheduledDate: string;
  method: string;
  panel: string[];
  calendarEventId?: string;
  videoLink?: string;
  status: string;
  feedbackId?: string;
  candidateFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

export const InterviewsService = {
  getAll: async (filters?: { applicationId?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.applicationId) params.append('applicationId', filters.applicationId);
    if (filters?.status) params.append('status', filters.status);
    const query = params.toString();
    return api.get<Interview[]>(`/recruitment/interviews${query ? `?${query}` : ''}`);
  },
  getById: async (id: string) => {
    return api.get<Interview>(`/recruitment/interviews/${id}`);
  },
  getByApplication: async (applicationId: string) => {
    return api.get<Interview[]>(`/recruitment/interviews/application/${applicationId}`);
  },
  create: async (data: Partial<Interview>) => {
    return api.post('/recruitment/interviews', data);
  },
  updateStatus: async (id: string, status: string) => {
    return api.put(`/recruitment/interviews/${id}/status`, { status });
  },
};

// Offers
export interface Offer {
  _id: string;
  applicationId: string;
  candidateId: string;
  hrEmployeeId?: string;
  grossSalary: number;
  signingBonus?: number;
  benefits?: string[];
  conditions?: string;
  insurances?: string;
  content: string;
  role: string;
  deadline: string;
  applicantResponse: string;
  approvers: any[];
  finalStatus: string;
  candidateSignedAt?: string;
  hrSignedAt?: string;
  managerSignedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const OffersService = {
  getAll: async (filters?: { applicationId?: string; candidateId?: string; finalStatus?: string }) => {
    const params = new URLSearchParams();
    if (filters?.applicationId) params.append('applicationId', filters.applicationId);
    if (filters?.candidateId) params.append('candidateId', filters.candidateId);
    if (filters?.finalStatus) params.append('finalStatus', filters.finalStatus);
    const query = params.toString();
    return api.get<Offer[]>(`/recruitment/offers${query ? `?${query}` : ''}`);
  },
  getById: async (id: string) => {
    return api.get<Offer>(`/recruitment/offers/${id}`);
  },
  create: async (data: Partial<Offer>) => {
    return api.post('/recruitment/offers', data);
  },
  send: async (id: string) => {
    return api.post(`/recruitment/offers/${id}/send`);
  },
  accept: async (id: string) => {
    return api.post(`/recruitment/offers/${id}/accept`);
  },
  reject: async (id: string) => {
    return api.post(`/recruitment/offers/${id}/reject`);
  },
};

// Terminations
export interface Termination {
  _id: string;
  employeeId: string;
  initiator: string;
  reason: string;
  employeeComments?: string;
  hrComments?: string;
  status: string;
  terminationDate?: string;
  contractId: string;
  createdAt: string;
  updatedAt: string;
}

export const TerminationsService = {
  getAll: async (filters?: { employeeId?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.employeeId) params.append('employeeId', filters.employeeId);
    if (filters?.status) params.append('status', filters.status);
    const query = params.toString();
    return api.get<Termination[]>(`/recruitment/terminations${query ? `?${query}` : ''}`);
  },
  getById: async (id: string) => {
    return api.get<Termination>(`/recruitment/terminations/${id}`);
  },
  create: async (data: Partial<Termination>) => {
    return api.post('/recruitment/terminations', data);
  },
  approve: async (id: string) => {
    return api.post(`/recruitment/terminations/${id}/approve`);
  },
  reject: async (id: string) => {
    return api.post(`/recruitment/terminations/${id}/reject`);
  },
};

// Clearance Checklists
export interface ClearanceChecklist {
  _id: string;
  terminationId: string;
  items: Array<{
    department: string;
    status: string;
    comments?: string;
    updatedBy?: string;
    updatedAt?: string;
  }>;
  equipmentList: Array<{
    equipmentId: string;
    name: string;
    returned: boolean;
    condition: string;
  }>;
  cardReturned: boolean;
  createdAt: string;
  updatedAt: string;
}

export const ClearanceChecklistsService = {
  getAll: async (filters?: { terminationId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.terminationId) params.append('terminationId', filters.terminationId);
    const query = params.toString();
    return api.get<ClearanceChecklist[]>(`/recruitment/clearance-checklists${query ? `?${query}` : ''}`);
  },
  getById: async (id: string) => {
    return api.get<ClearanceChecklist>(`/recruitment/clearance-checklists/${id}`);
  },
  create: async (data: Partial<ClearanceChecklist>) => {
    return api.post('/recruitment/clearance-checklists', data);
  },
  update: async (id: string, data: Partial<ClearanceChecklist>) => {
    return api.put(`/recruitment/clearance-checklists/${id}`, data);
  },
  updateDepartment: async (id: string, department: string, status: string, comments?: string) => {
    return api.put(`/recruitment/clearance-checklists/${id}/department`, { department, status, comments });
  },
  updateEquipment: async (id: string, equipmentId: string, returned: boolean, condition?: string) => {
    return api.put(`/recruitment/clearance-checklists/${id}/equipment`, { equipmentId, returned, condition });
  },
  updateCard: async (id: string, cardReturned: boolean) => {
    return api.put(`/recruitment/clearance-checklists/${id}/card`, { cardReturned });
  },
};

// Analytics
export const AnalyticsService = {
  getHiringFunnel: async () => {
    return api.get('/recruitment/analytics/hiring-funnel');
  },
  getSourceEffectiveness: async () => {
    return api.get('/recruitment/analytics/source-effectiveness');
  },
  getTimeToFill: async () => {
    return api.get('/recruitment/analytics/time-to-fill');
  },
  getInterviews: async () => {
    return api.get('/recruitment/analytics/interviews');
  },
  getOffers: async () => {
    return api.get('/recruitment/analytics/offers');
  },
  getProgress: async () => {
    return api.get('/recruitment/analytics/progress');
  },
};
