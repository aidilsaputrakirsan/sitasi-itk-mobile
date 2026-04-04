import api from '../client';
import type {
  ApiResponse,
  PaginatedResponse,
  Bimbingan,
  BimbinganRequest,
  BimbinganStatus,
  ListParams,
} from '../../types';

export const bimbinganApi = {
  list(params?: ListParams & { status?: BimbinganStatus; dosen_id?: number }) {
    return api.get<PaginatedResponse<Bimbingan>>('/bimbingan', { params });
  },

  create(data: BimbinganRequest) {
    return api.post<ApiResponse<Bimbingan>>('/bimbingan', data);
  },

  getById(id: number) {
    return api.get<ApiResponse<Bimbingan>>(`/bimbingan/${id}`);
  },

  update(id: number, data: Partial<BimbinganRequest>) {
    return api.put<ApiResponse<Bimbingan>>(`/bimbingan/${id}`, data);
  },

  delete(id: number) {
    return api.delete<ApiResponse<null>>(`/bimbingan/${id}`);
  },

  // Dosen actions
  approve(id: number, data?: { hasil_bimbingan?: string }) {
    return api.post<ApiResponse<Bimbingan>>(`/bimbingan/${id}/approve`, data ?? {});
  },

  reject(id: number, data: { hasil_bimbingan: string }) {
    return api.post<ApiResponse<Bimbingan>>(`/bimbingan/${id}/reject`, data);
  },
};
