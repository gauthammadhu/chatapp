import axios from 'axios';
import type { AuthResponse, User, Thread } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  googleAuth: async (idToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/google', { idToken });
    return response.data;
  },
};

export const userAPI = {
  setUsername: async (username: string): Promise<{ success: boolean; user: User }> => {
    const response = await api.post('/api/user/username', { username });
    return response.data;
  },

  updateUsername: async (username: string): Promise<{ success: boolean; user: User }> => {
    const response = await api.put('/api/user/username', { username });
    return response.data;
  },

  getProfile: async (): Promise<{ success: boolean; user: User }> => {
    const response = await api.get('/api/user/profile');
    return response.data;
  },

  searchUsers: async (query: string): Promise<{ success: boolean; users: User[] }> => {
    const response = await api.get(`/api/user/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};

export const threadAPI = {
  createThread: async (recipientUsername: string): Promise<{ success: boolean; thread: Thread; existed: boolean }> => {
    const response = await api.post('/api/threads', { recipientUsername });
    return response.data;
  },

  getThreads: async (): Promise<{ success: boolean; threads: Thread[] }> => {
    const response = await api.get('/api/threads');
    return response.data;
  },
};

export default api;
