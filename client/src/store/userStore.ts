import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { userApi } from '@/services/api';

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await userApi.login(email, password);
          
          if (response.success) {
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
            return { success: true, message: response.message };
          } else {
            set({ isLoading: false });
            return { success: false, message: response.message };
          }
        } catch (error: any) {
          set({ isLoading: false });
          const message = error.response?.data?.message || '登录失败';
          return { success: false, message };
        }
      },

      register: async (username: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await userApi.register(username, email, password);
          
          if (response.success) {
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
            return { success: true, message: response.message };
          } else {
            set({ isLoading: false });
            return { success: false, message: response.message };
          }
        } catch (error: any) {
          set({ isLoading: false });
          const message = error.response?.data?.message || '注册失败';
          return { success: false, message };
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      fetchProfile: async () => {
        const token = get().token;
        if (!token) return;

        try {
          const response = await userApi.getProfile();
          if (response.success) {
            set({ user: response.data });
          }
        } catch (error) {
          console.error('获取用户信息失败:', error);
        }
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
