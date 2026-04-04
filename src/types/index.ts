// ==================== Auth ====================

export interface MahasiswaDetail {
  id: number;
  nama: string;
  nim: string;
  email: string;
  nomor_telepon: string;
}

export interface DosenDetail {
  id: number;
  nama: string;
  nip: string;
  email: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  nim?: string;
  nip?: string;
  telpon?: string;
  judul_ta?: string;
  photo?: string;
  signature?: string;
  roles: string[];
  permissions: string[];
  mahasiswa?: MahasiswaDetail;
  dosen?: DosenDetail;
  prodi?: string;
}

export type UserRole = 'mahasiswa' | 'dosen' | 'tendik' | 'koorpro';

export interface LoginRequest {
  login: string;
  password: string;
  device_name: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  token_type: string;
  expires_at: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface TokenInfo {
  id: number;
  name: string;
  last_used_at: string | null;
  created_at: string;
  expires_at: string | null;
  is_current: boolean;
}

// ==================== API Response ====================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
  links: PaginationLinks;
}

export interface ValidationErrorResponse {
  success: false;
  message: string;
  errors: Record<string, string[]>;
}

// ==================== Bimbingan ====================

export type BimbinganStatus = 'created' | 'approved' | 'rejected';

export interface Bimbingan {
  id: number;
  tanggal: string;
  ket_bimbingan: string;
  hasil_bimbingan?: string;
  status: BimbinganStatus;
  mahasiswa?: { id: number; nama: string; nim: string };
  dosen?: { id: number; nama: string };
  created_at: string;
  updated_at: string;
}

export interface BimbinganRequest {
  tanggal: string;
  dosen: number; // user_id
  ket_bimbingan: string;
  hasil_bimbingan?: string;
}

// ==================== Pengajuan TA ====================

export type PengajuanTAStatus = 'pending' | 'approved' | 'rejected' | 'revision';

export interface PengajuanTA {
  id: number;
  judul: string;
  bidang_penelitian: string;
  status: PengajuanTAStatus;
  keterangan?: string;
  pembimbing_1?: { id: number; nama: string };
  pembimbing_2?: { id: number; nama: string };
  mahasiswa?: { id: number; nama: string; nim: string };
  created_at: string;
  updated_at: string;
}

export interface PengajuanTARequest {
  judul: string;
  bidang_penelitian: string;
  pembimbing_1: number;
  pembimbing_2?: number;
}

export interface AvailableDosen {
  id: number;
  name: string;
  nip?: string;
  prodi?: string;
  is_eksternal?: boolean;
}

// ==================== Sempro ====================

export type SemproStatus = 'on_process' | 'approved' | 'rejected' | 'revision' | 'scheduled';

export interface Sempro {
  id: number;
  status: SemproStatus;
  mahasiswa?: { id: number; nama: string; nim: string };
  pembimbing_1?: { id: number; nama: string };
  pembimbing_2?: { id: number; nama: string };
  penguji_1?: { id: number; nama: string };
  penguji_2?: { id: number; nama: string };
  jadwal?: JadwalSempro;
  revisi_status?: Record<string, boolean>;
  form_ta_012?: string;
  bukti_plagiasi?: string;
  proposal_ta?: string;
  created_at: string;
  updated_at: string;
}

export interface SemproRegistrationFiles {
  form_ta_012: { uri: string; type: string; name: string };
  bukti_plagiasi: { uri: string; type: string; name: string };
  proposal_ta: { uri: string; type: string; name: string };
}

// ==================== Sidang ====================

export type SidangStatus = 'on_process' | 'Diterima' | 'Ditolak' | 'revision' | 'scheduled';

export interface Sidang {
  id: number;
  status: SidangStatus;
  mahasiswa?: { id: number; nama: string; nim: string };
  pembimbing_1?: { id: number; nama: string };
  pembimbing_2?: { id: number; nama: string };
  penguji_1?: { id: number; nama: string };
  penguji_2?: { id: number; nama: string };
  jadwal?: JadwalSidang;
  revisi_status?: Record<string, boolean>;
  lembar_revisi?: string;
  draft_ta?: string;
  bukti_plagiasi?: string;
  created_at: string;
  updated_at: string;
}

export interface SidangRegistrationFiles {
  lembar_revisi: { uri: string; type: string; name: string };
  draft_ta: { uri: string; type: string; name: string };
  bukti_plagiasi: { uri: string; type: string; name: string };
}

// ==================== Jadwal ====================

export interface JadwalSempro {
  id: number;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  ruangan?: string;
  periode?: Periode;
  mahasiswa?: { id: number; nama: string; nim: string };
}

export interface JadwalSidang {
  id: number;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  ruangan?: string;
  periode?: Periode;
  mahasiswa?: { id: number; nama: string; nim: string };
}

export interface MySchedule {
  sempro: JadwalSempro[];
  sidang: JadwalSidang[];
}

// ==================== Periode ====================

export type PeriodeType = 'sempro' | 'sidang';
export type PeriodeStatus = 'active' | 'inactive';

export interface Periode {
  id: number;
  nama: string;
  type: PeriodeType;
  status: PeriodeStatus;
  tanggal_mulai: string;
  tanggal_selesai: string;
  is_tampilkan: boolean;
  created_at: string;
  updated_at: string;
}

export interface PeriodeRequest {
  nama: string;
  type: PeriodeType;
  status?: PeriodeStatus;
  tanggal_mulai: string;
  tanggal_selesai: string;
  is_tampilkan?: boolean;
}

// ==================== Katalog ====================

export interface Katalog {
  id: number;
  judul: string;
  abstrak?: string;
  kata_kunci?: string;
  tahun?: number;
  mahasiswa?: { id: number; nama: string; nim: string };
  pembimbing_1?: { id: number; nama: string };
  pembimbing_2?: { id: number; nama: string };
  file_url?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface KatalogRequest {
  judul?: string;
  abstrak?: string;
  kata_kunci?: string;
}

// ==================== Notifikasi ====================

export interface Notifikasi {
  id: number;
  title: string;
  message: string;
  type?: string;
  read_at: string | null;
  data?: Record<string, unknown>;
  created_at: string;
}

// ==================== Dashboard ====================

export interface DashboardData {
  [key: string]: unknown;
}

// ==================== User Management (Admin) ====================

export interface CreateUserRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  nim?: string;
  nip?: string;
  prodi?: string;
}

export interface UpdateUserRequest {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  nim?: string;
  nip?: string;
  prodi?: string;
}

// ==================== Common ====================

export interface ListParams {
  page?: number;
  per_page?: number;
  search?: string;
}
