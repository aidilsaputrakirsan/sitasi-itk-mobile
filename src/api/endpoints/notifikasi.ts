import api from '../client';
import type { ApiResponse, PaginatedResponse, Notifikasi, ListParams } from '../../types';

export const notifikasiApi = {
  list(params?: ListParams & { read?: boolean }) {
    return api.get<PaginatedResponse<Notifikasi>>('/notifikasi', { params });
  },

  unreadCount() {
    return api.get<ApiResponse<{ count: number }>>('/notifikasi/unread-count');
  },

  getById(id: number) {
    return api.get<ApiResponse<Notifikasi>>(`/notifikasi/${id}`);
  },

  markAsRead(id: number) {
    return api.post<ApiResponse<null>>(`/notifikasi/${id}/read`);
  },

  markAllAsRead() {
    return api.post<ApiResponse<null>>('/notifikasi/mark-all-read');
  },

  delete(id: number) {
    return api.delete<ApiResponse<null>>(`/notifikasi/${id}`);
  },

  clearRead() {
    return api.delete<ApiResponse<null>>('/notifikasi/clear-read');
  },
};
