import api from '../client';
import type {
  ApiResponse,
  PaginatedResponse,
  JadwalSempro,
  JadwalSidang,
  MySchedule,
} from '../../types';

export const jadwalApi = {
  mySchedule() {
    return api.get<ApiResponse<MySchedule>>('/jadwal/my-schedule');
  },

  upcoming() {
    return api.get<ApiResponse<MySchedule>>('/jadwal/upcoming');
  },

  // Admin
  listSempro(params?: { periode_id?: number; tanggal?: string; page?: number; per_page?: number }) {
    return api.get<PaginatedResponse<JadwalSempro>>('/jadwal/sempro', { params });
  },

  getSemproById(id: number) {
    return api.get<ApiResponse<JadwalSempro>>(`/jadwal/sempro/${id}`);
  },

  listSidang(params?: { periode_id?: number; page?: number; per_page?: number }) {
    return api.get<PaginatedResponse<JadwalSidang>>('/jadwal/sidang', { params });
  },

  getSidangById(id: number) {
    return api.get<ApiResponse<JadwalSidang>>(`/jadwal/sidang/${id}`);
  },
};
