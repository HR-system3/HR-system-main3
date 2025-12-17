import api from '@/lib/axios';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginResponse {
  statusCode: number;
  message: string;
  user: {
    userid: string;
    role: string;
    name: string;
  };
  access_token: string;
}

export interface RegisterResponse {
  statusCode: number;
  message: string;
  data: string;
}

class AuthService {
  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/auth/register', data);
    return response.data;
  }

  /**
   * Get current user info
   */
  async getMe(): Promise<any> {
    const response = await api.get('/auth/me');
    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Even if API call fails, clear local storage
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      // Clear employeeId cache
      const { clearEmployeeIdCache } = await import('@/lib/utils/auth');
      clearEmployeeIdCache();
    }
  }
}

export const authService = new AuthService();

