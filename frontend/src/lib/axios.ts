import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn('NEXT_PUBLIC_API_URL is not set. Using default: http://localhost:3000');
}

const api = axios.create({
  baseURL,
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (error: any) => {
    // Ensure error is an object
    if (!error || typeof error !== 'object') {
      error = { message: String(error || 'Unknown error') };
    }

    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Only redirect if not already on login/signup page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        window.location.href = "/login";
      }
    }
    
    // Handle network errors (backend not running, CORS issues, etc.)
    if (!error.response) {
      const errorMessage = error?.message || error?.toString() || 'Network error occurred';
      console.error('Network error:', errorMessage);
      // Create a user-friendly error object
      error.userMessage = 'Unable to connect to server. Please check if the backend is running.';
      error.isNetworkError = true;
    }
    
    // Handle other errors with better messages
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.data);
      error.userMessage = 'Server error occurred. Please try again later.';
    }
    
    return Promise.reject(error);
  }
);

export default api;
