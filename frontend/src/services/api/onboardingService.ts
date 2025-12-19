import api from '@/lib/axios';

export interface OnboardingTask {
  _id: string;
  name: string;
  department: string;
  status: string;
  deadline?: string;
  completedAt?: string;
  documentId?: string;
  notes?: string;
}

export interface Onboarding {
  _id: string;
  employeeId: string;
  tasks: OnboardingTask[];
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const OnboardingService = {
  // Get checklist for employee
  getChecklist: async (employeeId: string) => {
    return api.get<Onboarding>(`/recruitment/onboarding/${employeeId}`);
  },

  // Toggle task
  toggleTask: async (employeeId: string, taskId: string, completed: boolean) => {
    return api.patch(`/recruitment/onboarding/${employeeId}/tasks/${taskId}`, { completed });
  },

  // Terminate (Offboarding) - Note: This should use terminations endpoint
  terminateEmployee: async (employeeId: string, data: { reason: string; type: string; lastWorkingDay: string }) => {
    return api.post(`/recruitment/terminations`, {
      employeeId,
      ...data,
    });
  }
};
