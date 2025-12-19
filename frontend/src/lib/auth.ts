import { jwtDecode } from 'jwt-decode';
import { authService } from '@/services/api/auth.service';

export interface UserPayload {
  userid: string;
  role: string;
  name: string;
  employeeId?: string;
}

/**
 * Get token from localStorage using the existing authService token key
 */
export function getToken(): string | null {
  return authService.getToken();
}

/**
 * Decode user from JWT token
 */
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

/**
 * Get employee ID - tries token first, then /auth/me endpoint
 * Uses existing authService for API calls
 */
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

  // Fetch from /auth/me endpoint using existing authService
  try {
    const userData = await authService.getMe();
    if (userData?.employeeId) {
      cachedEmployeeId = userData.employeeId;
      return cachedEmployeeId;
    }
    // Fallback: try id or userid as employeeId
    if (userData?.id || userData?.userid) {
      cachedEmployeeId = userData.id || userData.userid;
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

/**
 * Get user ID from token
 */
export function getUserId(): string | null {
  const user = getUserFromToken();
  return user?.userid || null;
}

/**
 * Get user role from token
 */
export function getUserRole(): string | null {
  const user = getUserFromToken();
  return user?.role || null;
}

/**
 * Check if user is a manager
 * Supports various manager role names
 */
export function isManager(): boolean {
  const role = getUserRole();
  if (!role) return false;
  const roleLower = role.toLowerCase();
  return (
    roleLower.includes('manager') ||
    roleLower.includes('department head') ||
    roleLower.includes('hr') ||
    roleLower.includes('admin') ||
    roleLower === 'hr_admin'
  );
}

/**
 * Check if user is an employee
 */
export function isEmployee(): boolean {
  const role = getUserRole();
  if (!role) return false;
  const roleLower = role.toLowerCase();
  return (
    roleLower.includes('employee') ||
    roleLower === 'department employee'
  );
}

