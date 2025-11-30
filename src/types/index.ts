export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  nim: string | null;
  telpon: string | null;
  photo: string | null;
  roles: string[];
  is_mahasiswa: boolean;
  is_dosen: boolean;
  is_tendik: boolean;
  is_koorpro: boolean;
  mahasiswa?: Mahasiswa;
  dosen?: Dosen;
  created_at: string;
  updated_at: string;
}

export interface Mahasiswa {
  id: number;
  user_id: number;
  nim: string;
  nama: string;
  prodi: string;
  angkatan: string;
  created_at: string;
  updated_at: string;
}

export interface Dosen {
  id: number;
  user_id: number;
  nip: string;
  nama: string;
  prodi: string;
  created_at: string;
  updated_at: string;
}

export interface Bimbingan {
  id: number;
  user_id: number;
  tanggal: string;
  topik: string;
  keterangan: string;
  file: string | null;
  status: 'Pending' | 'Disetujui' | 'Ditolak';
  catatan_dosen: string | null;
  created_at: string;
  updated_at: string;
}

export interface BimbinganStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface LoginResponse {
  token: string;
  token_type: string;
  user: User;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Bimbingan: undefined;
  Profile: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
};

export type BimbinganStackParamList = {
  BimbinganList: undefined;
  BimbinganDetail: { id: number };
  CreateBimbingan: undefined;
  EditBimbingan: { id: number; bimbingan: Bimbingan };
};
