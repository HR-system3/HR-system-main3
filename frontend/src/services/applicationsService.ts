import api from '@/lib/api';

export interface Application {
  id: number;
  name: string;
  email?: string;
  job: string;
  status: 'Applied' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
  date: string;
}

export interface ApplicationInput {
  name: string;
  email: string;
  cvFile?: File; 
  jobId: string | number;
}

export const ApplicationsService = {
  // Get all applications
  getAll: async () => {
    // return api.get<Application[]>('/applications');
    // MOCK
    return Promise.resolve({ data: [
        { id: 1, name: 'John Doe', job: 'Senior Frontend Developer', status: 'Applied', date: '2025-12-15' },
        { id: 2, name: 'Jane Smith', job: 'Product Designer', status: 'Interview', date: '2025-12-14' },
    ] as Application[] });
  },

  // Apply to a job
  apply: async (data: ApplicationInput) => {
    return api.post('/applications', data);
  },

  // Update status
  updateStatus: async (id: number, status: string) => {
    return api.patch(`/applications/${id}/status`, { status });
  }
};
