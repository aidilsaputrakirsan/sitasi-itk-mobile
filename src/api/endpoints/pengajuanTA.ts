import api from '../client';
import type {
  ApiResponse,
  PaginatedResponse,
  PengajuanTA,
  PengajuanTARequest,
  AvailableDosen,
  ListParams,
} from '../../types';

export const pengajuanTAApi = {
  list(params?: ListParams) {
    return api.get<PaginatedResponse<PengajuanTA>>('/pengajuan-ta', { params });
  },

  create(data: PengajuanTARequest) {
    return api.post<ApiResponse<PengajuanTA>>('/pengajuan-ta', data);
  },

  getAvailableDosen() {
    return api.get<ApiResponse<AvailableDosen[]>>('/pengajuan-ta/available-dosen');
  },

  getById(id: number) {
    return api.get<ApiResponse<PengajuanTA>>(`/pengajuan-ta/${id}`);
  },

  update(id: number, data: Partial<PengajuanTARequest>) {
    return api.put<ApiResponse<PengajuanTA>>(`/pengajuan-ta/${id}`, data);
  },

  // Dosen actions
  approve(id: number) {
    return api.post<ApiResponse<PengajuanTA>>(`/pengajuan-ta/${id}/approve`);
  },

  reject(id: number, data: { keterangan: string }) {
    return api.post<ApiResponse<PengajuanTA>>(`/pengajuan-ta/${id}/reject`, data);
  },
};
