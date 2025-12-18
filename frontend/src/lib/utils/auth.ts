import { jwtDecode } from 'jwt-decode';

export interface UserPayload {
  userid: string;
  role: string;
  name: string;
  employeeId?: string;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getUserFromToken(): UserPayload | null {
  const token = getToken();
  if (!token) return null;

  try {
    return jwtDecode<UserPayload>(token);
  } catch {
    return null;
  }
}

let cachedEmployeeId: string | null = null;

export async function getEmployeeId(): Promise<string | null> {
  // Return cached value if available
  if (cachedEmployeeId) {
    return cachedEmployeeId;
  }

  // Try to get from token first
  const user = getUserFromToken();
  if (user?.employeeId) {
    cachedEmployeeId = user.employeeId;
    return cachedEmployeeId;
  }

  // Fetch from /auth/me endpoint
  try {
    const api = (await import('@/lib/axios')).default;
    const response = await api.get('/auth/me');
    if (response.data?.employeeId) {
      cachedEmployeeId = response.data.employeeId;
      return cachedEmployeeId;
    }
  } catch (error) {
    console.error('Error fetching employeeId:', error);
  }

  return null;
}

export function clearEmployeeIdCache() {
  cachedEmployeeId = null;
}

export function getUserId(): string | null {
  const user = getUserFromToken();
  return user?.userid || null;
}

export function getUserRole(): string | null {
  const user = getUserFromToken();
  return user?.role || null;
}

export function isManager(): boolean {
  const role = getUserRole();
  return role === 'department head' || role === 'MANAGER';
}

export function isEmployee(): boolean {
  const role = getUserRole();
  return role === 'department employee' || role === 'EMPLOYEE';
}

