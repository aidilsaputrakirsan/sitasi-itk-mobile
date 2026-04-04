import api from '../client';
import type { ApiResponse, PaginatedResponse, Sempro, ListParams } from '../../types';

export const semproApi = {
  list(params?: ListParams) {
    return api.get<PaginatedResponse<Sempro>>('/sempro', { params });
  },

  register(formData: FormData) {
    return api.post<ApiResponse<Sempro>>('/sempro', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  myStatus() {
    return api.get<ApiResponse<{ registered: boolean; sempro?: Sempro }>>('/sempro/my-status');
  },

  getById(id: number) {
    return api.get<ApiResponse<Sempro>>(`/sempro/${id}`);
  },

  update(id: number, formData: FormData) {
    return api.put<ApiResponse<Sempro>>(`/sempro/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Dosen actions
  submitRevisi(id: number, data: { role: string; status: boolean }) {
    return api.post<ApiResponse<Sempro>>(`/sempro/${id}/revisi`, data);
  },

  approve(id: number, data: { role: string }) {
    return api.post<ApiResponse<Sempro>>(`/sempro/${id}/approve`, data);
  },
};
