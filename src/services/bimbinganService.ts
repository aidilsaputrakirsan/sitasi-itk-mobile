import apiClient from '../api/client';
import { Bimbingan, BimbinganStatistics } from '../types';

export interface CreateBimbinganData {
  tanggal: string;      // "YYYY-MM-DD"
  topik: string;
  keterangan: string;
  file?: string;        // Optional, skip for Phase 1
}

export const bimbinganService = {
  getBimbingans: async (): Promise<Bimbingan[]> => {
    const response = await apiClient.get('/bimbingan');
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get bimbingans');
  },

  getBimbinganById: async (id: number): Promise<Bimbingan> => {
    const response = await apiClient.get(`/bimbingan/${id}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get bimbingan');
  },

  getStatistics: async (): Promise<BimbinganStatistics> => {
    const response = await apiClient.get('/bimbingan/statistics');
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get statistics');
  },

  createBimbingan: async (data: CreateBimbinganData): Promise<Bimbingan> => {
    const response = await apiClient.post('/bimbingan', data);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create bimbingan');
  },

  updateBimbingan: async (id: number, data: Partial<CreateBimbinganData>): Promise<Bimbingan> => {
    const response = await apiClient.put(`/bimbingan/${id}`, data);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update bimbingan');
  },

  deleteBimbingan: async (id: number): Promise<void> => {
    const response = await apiClient.delete(`/bimbingan/${id}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to delete bimbingan');
  },
};
