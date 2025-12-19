// ./src/lib/axios.ts
import axios from "axios";

const baseURL =process.env.NEXT_PUBLIC_API_URL;
if(!baseURL){
  throw new Error('NEXT_PUBLIC_API_URL is not set');
}

// TEMP debug logging - log baseURL at startup
if (typeof window !== 'undefined') {
  console.log('[Axios] Base URL configured:', baseURL);
  console.log('[Axios] NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL || 'not set (using default)');
}

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // TEMP debug logging for Leaves endpoints in dev
    if (process.env.NODE_ENV === 'development' && config.url?.includes('/leaves/')) {
      const fullUrl = `${config.baseURL}${config.url}`;
      console.log('[Axios] Leaves API Request:', {
        method: config.method?.toUpperCase(),
        path: config.url,
        fullUrl,
        hasToken: !!token,
        baseURL: config.baseURL,
      });
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      // Only redirect if we're not already on the login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    // Note: 403 errors are handled in individual components to show user-friendly messages
    
    return Promise.reject(error);
  }
);

export { api };
export default api;