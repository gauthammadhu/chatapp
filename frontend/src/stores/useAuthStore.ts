import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { authAPI, userAPI } from '../services/api';
import { socketService } from '../services/socket';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  needsUsername: boolean;

  // Actions
  login: (idToken: string) => Promise<void>;
  setUsername: (username: string) => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      needsUsername: false,

      login: async (idToken: string) => {
        try {
          const response = await authAPI.googleAuth(idToken);

          // Store token in localStorage
          localStorage.setItem('token', response.token);

          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            needsUsername: response.user.needsUsername,
          });

          // Connect socket if username is set
          if (!response.user.needsUsername) {
            socketService.connect(response.token);
          }
        } catch (error) {
          console.error('Login failed:', error);
          throw error;
        }
      },

      setUsername: async (username: string) => {
        try {
          const response = await userAPI.setUsername(username);
          const { token } = get();

          set({
            user: response.user,
            needsUsername: false,
          });

          // Connect socket after username is set
          if (token) {
            socketService.connect(token);
          }
        } catch (error) {
          console.error('Set username failed:', error);
          throw error;
        }
      },

      updateUsername: async (username: string) => {
        try {
          const response = await userAPI.updateUsername(username);

          set({
            user: response.user,
          });
        } catch (error) {
          console.error('Update username failed:', error);
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        socketService.disconnect();

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          needsUsername: false,
        });
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) {
          return;
        }

        try {
          const response = await userAPI.getProfile();
          set({
            user: response.user,
            isAuthenticated: true,
            needsUsername: !response.user.username,
          });

          // Connect socket if username is set
          if (response.user.username) {
            socketService.connect(token);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
      }),
    }
  )
);
