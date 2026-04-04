import api from '../client';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  User,
  ChangePasswordRequest,
  TokenInfo,
} from '../../types';

export const authApi = {
  login(data: LoginRequest) {
    return api.post<ApiResponse<LoginResponse>>('/auth/login', data);
  },

  logout() {
    return api.post<ApiResponse<null>>('/auth/logout');
  },

  logoutAll() {
    return api.post<ApiResponse<null>>('/auth/logout-all');
  },

  me() {
    return api.get<ApiResponse<User>>('/auth/me');
  },

  refresh() {
    return api.post<ApiResponse<{ token: string; expires_at: string }>>('/auth/refresh');
  },

  changePassword(data: ChangePasswordRequest) {
    return api.post<ApiResponse<null>>('/auth/change-password', data);
  },

  getTokens() {
    return api.get<ApiResponse<TokenInfo[]>>('/auth/tokens');
  },

  revokeToken(tokenId: number) {
    return api.delete<ApiResponse<null>>(`/auth/tokens/${tokenId}`);
  },
};
