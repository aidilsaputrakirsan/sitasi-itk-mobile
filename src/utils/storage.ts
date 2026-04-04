import * as SecureStore from 'expo-secure-store';

const KEYS = {
  AUTH_TOKEN: 'auth_token',
  TOKEN_EXPIRES_AT: 'token_expires_at',
  USER_DATA: 'user_data',
} as const;

export const storage = {
  async saveToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.AUTH_TOKEN, token);
  },

  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.AUTH_TOKEN);
  },

  async saveExpiresAt(expiresAt: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.TOKEN_EXPIRES_AT, expiresAt);
  },

  async getExpiresAt(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.TOKEN_EXPIRES_AT);
  },

  async saveUser(user: object): Promise<void> {
    await SecureStore.setItemAsync(KEYS.USER_DATA, JSON.stringify(user));
  },

  async getUser<T>(): Promise<T | null> {
    const data = await SecureStore.getItemAsync(KEYS.USER_DATA);
    if (!data) return null;
    return JSON.parse(data) as T;
  },

  async clearAll(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.AUTH_TOKEN),
      SecureStore.deleteItemAsync(KEYS.TOKEN_EXPIRES_AT),
      SecureStore.deleteItemAsync(KEYS.USER_DATA),
    ]);
  },
};
