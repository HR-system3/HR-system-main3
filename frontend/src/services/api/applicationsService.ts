import api from '@/lib/axios';

export interface Application {
  _id: string;
  candidateId: string;
  requisitionId: string;
  assignedHr?: string;
  currentStage: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationInput {
  candidateId: string;
  requisitionId: string;
  assignedHr?: string;
}

export const ApplicationsService = {
  // Get all applications
  getAll: async (filters?: { requisitionId?: string; status?: string; candidateId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.requisitionId) params.append('requisitionId', filters.requisitionId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.candidateId) params.append('candidateId', filters.candidateId);
    
    const query = params.toString();
    return api.get<Application[]>(`/recruitment/applications${query ? `?${query}` : ''}`);
  },

  // Get single application
  getById: async (id: string) => {
    return api.get<Application>(`/recruitment/applications/${id}`);
  },

  // Apply to a job
  apply: async (data: ApplicationInput) => {
    return api.post('/recruitment/applications', data);
  },

  // Update status
  updateStatus: async (id: string, status: string, stage?: string) => {
    return api.put(`/recruitment/applications/${id}/status`, { status, stage });
  }
};
