import api from '../client';
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  AvailableDosen,
  ListParams,
} from '../../types';

export const usersApi = {
  getProfile() {
    return api.get<ApiResponse<User>>('/users/profile');
  },

  updateProfile(formData: FormData) {
    return api.post<ApiResponse<User>>('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Admin
  list(params?: ListParams & { role?: string }) {
    return api.get<PaginatedResponse<User>>('/users', { params });
  },

  create(data: CreateUserRequest) {
    return api.post<ApiResponse<User>>('/users', data);
  },

  getById(id: number) {
    return api.get<ApiResponse<User>>(`/users/${id}`);
  },

  update(id: number, data: UpdateUserRequest) {
    return api.put<ApiResponse<User>>(`/users/${id}`, data);
  },

  delete(id: number) {
    return api.delete<ApiResponse<null>>(`/users/${id}`);
  },

  resetData(id: number) {
    return api.post<ApiResponse<null>>(`/users/${id}/reset-data`);
  },

  // Dosen
  listDosen(params?: ListParams & { prodi?: string; is_eksternal?: boolean }) {
    return api.get<PaginatedResponse<AvailableDosen>>('/users/dosens', { params });
  },

  listMahasiswa(params?: ListParams) {
    return api.get<PaginatedResponse<User>>('/users/mahasiswas', { params });
  },
};
