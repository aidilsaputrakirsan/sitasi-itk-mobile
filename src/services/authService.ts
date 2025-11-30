import apiClient from '../api/client';
import { StorageService } from '../utils/storage';
import { LoginResponse, User } from '../types';

export const authService = {
  login: async (emailOrUsername: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', {
      email: emailOrUsername,  // Can be email or username
      password,
    });

    if (response.data.success) {
      const { token, user } = response.data.data;
      await StorageService.saveToken(token);
      await StorageService.saveUser(user);
      return { token, token_type: 'Bearer', user };
    }

    throw new Error(response.data.message || 'Login failed');
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      await StorageService.clearAll();
    }
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/auth/profile');
    if (response.data.success) {
      // Update user in AsyncStorage
      await StorageService.saveUser(response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get profile');
  },

  updateProfile: async (data: {
    name?: string;
    email?: string;
    telpon?: string;
    photo?: string;
  }): Promise<User> => {
    const response = await apiClient.put('/auth/profile', data);
    if (response.data.success) {
      // Update user in AsyncStorage
      await StorageService.saveUser(response.data.data);
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update profile');
  },

  changePassword: async (data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<any> => {
    const response = await apiClient.post('/auth/change-password', data);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to change password');
  },
};
