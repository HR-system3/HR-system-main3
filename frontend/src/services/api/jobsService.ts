import api from '@/lib/axios';

export interface JobPost {
  _id?: string;
  requisitionId: string;
  templateId?: string;
  openings: number;
  location?: string;
  hiringManagerId: string;
  publishStatus: 'draft' | 'published' | 'closed';
  postingDate?: string;
  expiryDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const JobsService = {
  // Get all jobs
  getAll: async (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return api.get<JobPost[]>(`/recruitment/jobs${query}`);
  },

  // Get single job
  getById: async (id: string) => {
    return api.get<JobPost>(`/recruitment/jobs/${id}`);
  },

  // Create new job
  create: async (data: JobPost) => {
    return api.post('/recruitment/jobs', data);
  },

  // Update job
  update: async (id: string, data: Partial<JobPost>) => {
    return api.put(`/recruitment/jobs/${id}`, data);
  },
};
