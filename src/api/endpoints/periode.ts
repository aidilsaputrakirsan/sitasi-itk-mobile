import api from '../client';
import type {
  ApiResponse,
  PaginatedResponse,
  Periode,
  PeriodeRequest,
  PeriodeType,
  PeriodeStatus,
} from '../../types';

export const periodeApi = {
  list(params?: { type?: PeriodeType; status?: PeriodeStatus; is_tampilkan?: boolean; page?: number; per_page?: number }) {
    return api.get<PaginatedResponse<Periode>>('/periode', { params });
  },

  create(data: PeriodeRequest) {
    return api.post<ApiResponse<Periode>>('/periode', data);
  },

  getActive() {
    return api.get<ApiResponse<Periode[]>>('/periode/active');
  },

  getById(id: number) {
    return api.get<ApiResponse<Periode>>(`/periode/${id}`);
  },

  update(id: number, data: Partial<PeriodeRequest>) {
    return api.put<ApiResponse<Periode>>(`/periode/${id}`, data);
  },

  delete(id: number) {
    return api.delete<ApiResponse<null>>(`/periode/${id}`);
  },
};
