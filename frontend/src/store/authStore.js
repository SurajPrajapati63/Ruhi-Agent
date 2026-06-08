import create from 'zustand';
import { apiClient } from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,

  signup: async (name, email, password) => {
    try {
      set({ error: null });
      const response = await apiClient.post('/auth/signup', {
        name,
        email,
        password,
      });
      set({ user: response.data.user, error: null });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed';
      set({ error: message });
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      set({ error: null });
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });
      set({ user: response.data.user, error: null });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message });
      throw error;
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
      set({ user: null, error: null });
    } catch (error) {
      const message = error.response?.data?.message || 'Logout failed';
      set({ error: message });
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      set({ user: response.data.user, loading: false });
    } catch (error) {
      set({ user: null, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
