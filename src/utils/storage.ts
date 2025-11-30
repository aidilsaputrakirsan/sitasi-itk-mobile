import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const THEME_KEY = 'theme';

export const StorageService = {
  // Token management
  async saveToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(TOKEN_KEY);
  },

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },

  // User management
  async saveUser(user: User): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async getUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(USER_KEY);
  },

  // Theme management
  async saveTheme(isDark: boolean): Promise<void> {
    await AsyncStorage.setItem(THEME_KEY, JSON.stringify(isDark));
  },

  async getTheme(): Promise<boolean | null> {
    const theme = await AsyncStorage.getItem(THEME_KEY);
    if (theme === null) return null;
    return JSON.parse(theme);
  },

  // Clear all data
  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },
};
