import api from '../client';
import type { ApiResponse, PaginatedResponse, Sidang, SidangStatus, ListParams } from '../../types';

export const sidangApi = {
  list(params?: ListParams) {
    return api.get<PaginatedResponse<Sidang>>('/sidang', { params });
  },

  register(formData: FormData) {
    return api.post<ApiResponse<Sidang>>('/sidang', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  myStatus() {
    return api.get<ApiResponse<{ registered: boolean; sidang?: Sidang }>>('/sidang/my-status');
  },

  getById(id: number) {
    return api.get<ApiResponse<Sidang>>(`/sidang/${id}`);
  },

  update(id: number, formData: FormData) {
    return api.put<ApiResponse<Sidang>>(`/sidang/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Dosen actions
  submitRevisi(id: number, data: { role: string; status: boolean }) {
    return api.post<ApiResponse<Sidang>>(`/sidang/${id}/revisi`, data);
  },

  // Admin action
  updateHasil(id: number, data: { status: SidangStatus }) {
    return api.put<ApiResponse<Sidang>>(`/sidang/${id}/hasil`, data);
  },
};
