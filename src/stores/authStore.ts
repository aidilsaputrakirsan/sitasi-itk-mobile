import { create } from 'zustand';
import * as Device from 'expo-device';
import { storage } from '../utils/storage';
import { authApi } from '../api/endpoints/auth';
import { setOnUnauthorized } from '../api/client';
import type { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  validationErrors: Record<string, string[]> | null;

  // Actions
  initialize: () => Promise<void>;
  login: (login: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  hasRole: (role: UserRole) => boolean;
  getPrimaryRole: () => UserRole | null;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Wire up 401 handler
  setOnUnauthorized(() => {
    set({ user: null, token: null, isAuthenticated: false });
  });

  return {
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
    validationErrors: null,

    initialize: async () => {
      try {
        const token = await storage.getToken();
        const user = await storage.getUser<User>();

        if (token && user) {
          set({ user, token, isAuthenticated: true, isLoading: false });
          // Verify token is still valid
          try {
            const response = await authApi.me();
            if (response.data.success) {
              const freshUser = response.data.data;
              await storage.saveUser(freshUser);
              set({ user: freshUser });
            }
          } catch {
            // Token invalid, clear everything
            await storage.clearAll();
            set({ user: null, token: null, isAuthenticated: false });
          }
        } else {
          set({ isLoading: false });
        }
      } catch {
        set({ isLoading: false });
      }
    },

    login: async (login: string, password: string) => {
      set({ isLoading: true, error: null, validationErrors: null });
      try {
        const deviceName = Device.modelName ?? Device.deviceName ?? 'React Native App';
        const response = await authApi.login({
          login,
          password,
          device_name: deviceName,
        });

        if (response.data.success) {
          const { user, token, expires_at } = response.data.data;
          await Promise.all([
            storage.saveToken(token),
            storage.saveExpiresAt(expires_at),
            storage.saveUser(user),
          ]);
          set({ user, token, isAuthenticated: true, isLoading: false, error: null });
          return true;
        }

        set({ isLoading: false, error: response.data.message });
        return false;
      } catch (err: unknown) {
        const error = err as { message?: string; errors?: Record<string, string[]> };
        set({
          isLoading: false,
          error: error.message ?? 'Login gagal',
          validationErrors: error.errors ?? null,
        });
        return false;
      }
    },

    logout: async () => {
      try {
        await authApi.logout();
      } catch {
        // Ignore — we clear local state regardless
      }
      await storage.clearAll();
      set({ user: null, token: null, isAuthenticated: false, error: null });
    },

    logoutAll: async () => {
      try {
        await authApi.logoutAll();
      } catch {
        // Ignore
      }
      await storage.clearAll();
      set({ user: null, token: null, isAuthenticated: false, error: null });
    },

    refreshUser: async () => {
      try {
        const response = await authApi.me();
        if (response.data.success) {
          const user = response.data.data;
          await storage.saveUser(user);
          set({ user });
        }
      } catch {
        // Silent fail
      }
    },

    clearError: () => set({ error: null, validationErrors: null }),

    hasRole: (role: UserRole) => {
      return get().user?.roles.includes(role) ?? false;
    },

    getPrimaryRole: () => {
      const roles = get().user?.roles;
      if (!roles?.length) return null;
      // Priority HARUS sama dengan backend DashboardController::index():
      // mahasiswa → dosen → koorpro/tendik. Kalau urutan beda, payload
      // dashboard tidak match shape yang dirender → crash di runtime.
      if (roles.includes('mahasiswa')) return 'mahasiswa';
      if (roles.includes('dosen')) return 'dosen';
      if (roles.includes('koorpro')) return 'koorpro';
      if (roles.includes('tendik')) return 'tendik';
      return null;
    },
  };
});
