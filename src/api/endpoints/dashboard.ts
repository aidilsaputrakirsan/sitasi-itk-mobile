import api from '../client';
import type { ApiResponse, DashboardData } from '../../types';

export const dashboardApi = {
  get() {
    return api.get<ApiResponse<DashboardData>>('/dashboard');
  },
};
