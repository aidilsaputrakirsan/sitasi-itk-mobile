import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../utils/storage';
import config from '../config/env';

const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Track if we're currently refreshing to avoid infinite loops
let isRefreshing = false;

// Request interceptor: attach token
api.interceptors.request.use(
  async (reqConfig: InternalAxiosRequestConfig) => {
    const token = await storage.getToken();
    if (token) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }

    // Auto-refresh check (if token is close to expiry)
    if (token && !isRefreshing) {
      const expiresAt = await storage.getExpiresAt();
      if (expiresAt) {
        const expiryTime = new Date(expiresAt).getTime();
        const now = Date.now();
        if (expiryTime - now < config.TOKEN_REFRESH_THRESHOLD_MS && expiryTime > now) {
          isRefreshing = true;
          try {
            const response = await axios.post(
              `${config.API_BASE_URL}/auth/refresh`,
              {},
              { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
            );
            if (response.data?.success && response.data?.data?.token) {
              const newToken = response.data.data.token;
              const newExpires = response.data.data.expires_at;
              await storage.saveToken(newToken);
              if (newExpires) await storage.saveExpiresAt(newExpires);
              reqConfig.headers.Authorization = `Bearer ${newToken}`;
            }
          } catch {
            // Refresh failed, continue with current token
          } finally {
            isRefreshing = false;
          }
        }
      }
    }

    return reqConfig;
  },
  (error) => Promise.reject(error)
);

// Callback for 401 handling — set by auth store to avoid circular imports
let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(callback: () => void) {
  onUnauthorized = callback;
}

// Response interceptor: handle errors globally
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ success: boolean; message: string; errors?: Record<string, string[]> }>) => {
    if (!error.response) {
      // Network error
      return Promise.reject({
        success: false,
        message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
        isNetworkError: true,
      });
    }

    const { status } = error.response;

    switch (status) {
      case 401:
        await storage.clearAll();
        onUnauthorized?.();
        break;
      case 429:
        return Promise.reject({
          success: false,
          message: 'Terlalu banyak percobaan. Coba lagi nanti.',
          status: 429,
        });
      case 500:
        return Promise.reject({
          success: false,
          message: 'Terjadi kesalahan server. Silakan coba lagi nanti.',
          status: 500,
        });
    }

    return Promise.reject(error.response.data ?? { success: false, message: 'Terjadi kesalahan' });
  }
);

export default api;
