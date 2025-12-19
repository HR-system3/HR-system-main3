import api from '@/lib/api';

export interface JobPost {
  id?: number;
  title: string;
  department: string;
  description: string;
  requirements: string;
  createdAt?: string;
}

export const JobsService = {
  // Get all jobs
  getAll: async () => {
    // return api.get<JobPost[]>('/jobs');
    // MOCK
    return Promise.resolve({ data: [
      { id: 1, title: 'Frontend Dev', department: 'Engineering', description: 'React', requirements: '3 yrs exp' },
      { id: 2, title: 'Product Manager', department: 'Product', description: 'Roadmap', requirements: '5 yrs exp' },
    ] });
  },

  // Create new job
  create: async (data: JobPost) => {
    console.log('API Create Job:', data);
    return api.post('/jobs', data); 
    // In real app, this would actually hit the endpoint. 
    // For now, if backend is missing, it might 404.
  },
};
