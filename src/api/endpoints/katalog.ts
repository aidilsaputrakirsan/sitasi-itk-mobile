import api from '../client';
import type { ApiResponse, PaginatedResponse, Katalog, KatalogRequest, ListParams } from '../../types';

export const katalogApi = {
  list(params?: ListParams) {
    return api.get<PaginatedResponse<Katalog>>('/katalog', { params });
  },

  getById(id: number) {
    return api.get<ApiResponse<Katalog>>(`/katalog/${id}`);
  },

  // Mahasiswa
  create(data: KatalogRequest) {
    return api.post<ApiResponse<Katalog>>('/katalog', data);
  },

  myKatalog() {
    return api.get<ApiResponse<Katalog>>('/katalog/my-katalog');
  },

  update(id: number, data: KatalogRequest) {
    return api.put<ApiResponse<Katalog>>(`/katalog/${id}`, data);
  },

  // Admin
  approve(id: number) {
    return api.post<ApiResponse<Katalog>>(`/katalog/${id}/approve`);
  },

  reject(id: number) {
    return api.delete<ApiResponse<null>>(`/katalog/${id}`);
  },
};
