// ./src/services/api/auth.service.ts

import { api } from '@/lib/axios';

// If you already have these types, keep importing them instead of re-declaring.
// import { LoginRequest, LoginResponse, User } from '@/types/auth.types';

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

/**
 * Raw backend response shape (as described in your code/comments).
 * Backend returns: { statusCode, message, user: { userid, role, name }, access_token }
 */
export interface BackendLoginResponse {
  statusCode: number;
  message: string;
  user: {
    userid?: string;
    id?: string;
    role?: string;
    name?: string;
  };
  access_token: string;
}

export interface BackendRegisterResponse {
  statusCode: number;
  message: string;
  data: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Normalized login response used by many frontends.
 */
export interface LoginResponse {
  access_token: string;
  user: User;
}

const TOKEN_KEY = 'auth_token';

class AuthService {
  /**
   * Login user (returns normalized structure: { access_token, user })
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<BackendLoginResponse>('/auth/login', credentials);

    const userPayload = response.data.user || {};

    const normalized: LoginResponse = {
      access_token: response.data.access_token,
      user: {
        id: userPayload.userid || userPayload.id || '',
        email: credentials.email, // email not always returned; safe fallback
        name: userPayload.name || '',
        role: userPayload.role || '',
      },
    };

    // Store token for later usage (combines v2 behavior)
    this.setToken(normalized.access_token);

    return normalized;
  }

  /**
   * If you still need the raw backend response somewhere in the codebase,
   * use this method (keeps v1 capability without breaking v2 normalization).
   */
  async loginRaw(credentials: LoginRequest): Promise<BackendLoginResponse> {
    const response = await api.post<BackendLoginResponse>('/auth/login', credentials);
    return response.data;
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<BackendRegisterResponse | { message: string }> {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      // Keep v2’s clearer network error handling
      if (error?.response) {
        throw error; // backend error with status/message
      }
      if (error?.request) {
        throw new Error(
          'Network error: Could not reach server. Please check if the backend is running.'
        );
      }
      throw error;
    }
  }

  /**
   * Get current user info (raw)
   * - v1 called it getMe()
   */
  async getMe(): Promise<any> {
    const response = await api.get('/auth/me');
    return response.data;
  }

  /**
   * Get profile (normalized User)
   * - v2 called it getProfile()
   */
  async getProfile(): Promise<User> {
    const data = await this.getMe();
    return {
      id: data?.id || data?.userid || '',
      email: data?.email || '',
      name: data?.name || '',
      role: data?.role || '',
    };
  }

  /**
   * Logout user:
   * - calls backend logout endpoint (v1)
   * - clears token storage (v1 + v2)
   * - clears employeeId cache (v1)
   * - redirects to /login (v2 behavior) WITHOUT forcing if you don’t want it
   */
  async logout(options?: { redirectToLogin?: boolean }): Promise<void> {
    const redirectToLogin = options?.redirectToLogin ?? true;

    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Even if API call fails, still clear local storage
      console.error('Logout error:', error);
    } finally {
      // Remove both possible keys to avoid “two token keys” bugs
      localStorage.removeItem('token'); // from v1
      this.removeToken(); // removes TOKEN_KEY from v2

      // Clear employeeId cache (v1)
      try {
        const { clearEmployeeIdCache } = await import('@/lib/auth');
        clearEmployeeIdCache();
      } catch (e) {
        // If this module doesn't exist in some subsystems, don't crash logout
        console.warn('Could not clear employeeId cache:', e);
      }

      if (redirectToLogin && typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  // =========================
  // Token helpers (v2)
  // =========================
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
export default authService;