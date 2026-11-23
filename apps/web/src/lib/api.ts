import axios from 'axios';
import { getAccessToken, clearAuthTokens } from './auth-storage';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  withCredentials: true,
});

// Attach JWT from cookies / localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Intercept 401 responses (expired / invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Clear all tokens & cookies
      clearAuthTokens();

      const publicPaths = ['/login', '/register', '/forgot-password', '/'];
      const currentPath = window.location.pathname;

      // Only redirect if currently on a protected route
      if (!publicPaths.includes(currentPath) && !currentPath.startsWith('/auth/')) {
        const fromParam = encodeURIComponent(currentPath + window.location.search);
        window.location.href = `/login?from=${fromParam}`;
      }
    }
    return Promise.reject(error);
  }
);

// User endpoints
export const usersApi = {
  getMe: () => api.get('/users/me').then((r) => r.data),
};

// Task endpoints
export const tasksApi = {
  create: (data: { input: string; inputType?: string }) =>
    api.post('/tasks', data).then((r) => r.data),
  getAll: () => api.get('/tasks').then((r) => r.data),
  getById: (id: string) => api.get(`/tasks/${id}`).then((r) => r.data),
  cancel: (id: string) => api.post(`/tasks/${id}/cancel`).then((r) => r.data),
  delete: (id: string) => api.delete(`/tasks/${id}`).then((r) => r.data),
};

// Approval endpoints
export const approvalsApi = {
  getById: (id: string) => api.get(`/approvals/${id}`).then((r) => r.data),
  approve: (id: string) => api.post(`/approvals/${id}/approve`).then((r) => r.data),
  reject: (id: string) => api.post(`/approvals/${id}/reject`).then((r) => r.data),
};

// Auth endpoints
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }).then((r) => r.data),
};

export default api;
