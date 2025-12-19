import api from '@/lib/api';

export interface OnboardingTask {
  id: number;
  text: string;
  completed: boolean;
}

export const OnboardingService = {
  // Get checklist for employee
  getChecklist: async (employeeId: number) => {
    // return api.get<OnboardingTask[]>(`/onboarding/${employeeId}`);
    return Promise.resolve({ data: [
        { id: 1, text: 'Submit Documents', completed: false },
        { id: 2, text: 'Sign Contract', completed: false },
    ] });
  },

  // Toggle task
  toggleTask: async (employeeId: number, taskId: number, completed: boolean) => {
    return api.patch(`/onboarding/${employeeId}/tasks/${taskId}`, { completed });
  },

  // Terminate (Offboarding)
  terminateEmployee: async (employeeId: number) => {
    return api.post(`/offboarding/${employeeId}/terminate`);
  }
};
