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

/**
 * Backend BimbinganResource:
 *   'mahasiswa' = UserResource(whenLoaded('user'))  → punya `name`, `nim`
 *   'dosen'     = UserResource(whenLoaded('dosenUser')) → punya `name`
 * Jadi inner field-nya `name`, BUKAN `nama`.
 */
export interface Bimbingan {
  id: number;
  tanggal: string;
  ket_bimbingan: string;
  hasil_bimbingan?: string;
  status: BimbinganStatus;
  user_id?: number;
  dosen_id?: number;
  mahasiswa?: { id: number; name: string; nim?: string; email?: string };
  dosen?: { id: number; name: string; email?: string };
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

/**
 * Backend SemproResource — field aktual yang dikirim API:
 *   'user'  = UserResource(whenLoaded('user'))   ← mahasiswa pemilik sempro
 *   'periode' = PeriodeResource
 *   revisi/approve disimpan sebagai datetime; null = belum, ada nilai = sudah.
 * Tidak ada field `mahasiswa`, `pembimbing_1`, `penguji_1`, dst pada response list.
 */
export interface Sempro {
  id: number;
  tanggal?: string;
  status: SemproStatus;
  hasil_sempro?: string;
  user_id?: number;
  user?: { id: number; name: string; nim?: string; email?: string };
  periode_id?: number;
  periode?: Periode;
  // datetime|null — truthy berarti sudah dilakukan
  revisi_pembimbing_1?: string | null;
  revisi_pembimbing_2?: string | null;
  revisi_penguji_1?: string | null;
  revisi_penguji_2?: string | null;
  approve_pembimbing_1?: string | null;
  approve_pembimbing_2?: string | null;
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

/**
 * Backend SidangTAResource — sama bentuk dengan SemproResource:
 *   'user' = UserResource(whenLoaded('user'))
 *   'periode' = PeriodeResource
 */
export interface Sidang {
  id: number;
  tanggal?: string;
  status: SidangStatus;
  user_id?: number;
  user?: { id: number; name: string; nim?: string; email?: string };
  periode_id?: number;
  periode?: Periode;
  revisi_pembimbing_1?: string | null;
  revisi_pembimbing_2?: string | null;
  revisi_penguji_1?: string | null;
  revisi_penguji_2?: string | null;
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

// ==================== Penilaian (Dosen input nilai) ====================

export type PenilaianRole = 'pembimbing_1' | 'pembimbing_2' | 'penguji_1' | 'penguji_2';

/** Form fields untuk submit penilaian Sempro (10 sub-komponen, 3 kriteria) */
export interface PenilaianSemproForm {
  // Kriteria I - Penulisan (15%)
  struktur_sistematika: number;
  kepatuhan_format: number;
  // Kriteria II - Pemaparan (30%)
  media_presentasi: number;
  komunikasi_verbal: number;
  komunikasi_nonverbal: number;
  // Kriteria III - Substansi (55%)
  pemahaman_materi: number;
  rumusan_masalah: number;
  relevansi_metode: number;
  kelayakan_rencana: number;
  relevansi_luaran: number;
}

/** Form fields untuk submit penilaian Sidang (12 sub-komponen, 4 kriteria) */
export interface PenilaianSidangForm extends PenilaianSemproForm {
  // Kriteria IV - Profesionalisme (15%) - khusus pembimbing
  etika_komunikasi: number;
  kemandirian_daya_juang: number;
}

/** Response detail satu penilaian (dari endpoint GET) */
export interface PenilaianSemproDetail extends PenilaianSemproForm {
  id: number;
  sempro_id: number;
  user_id: number;
  nilai_kriteria_1: number;
  nilai_kriteria_2: number;
  nilai_kriteria_3: number;
  total_nilai: number;
  updated_at?: string;
  penilai?: { id: number; nama: string };
}

export interface PenilaianSidangDetail extends PenilaianSidangForm {
  id: number;
  sidang_ta_id: number;
  user_id: number;
  nilai_kriteria_1: number;
  nilai_kriteria_2: number;
  nilai_kriteria_3: number;
  nilai_kriteria_4: number | null;
  total_nilai: number;
  updated_at?: string;
  is_pembimbing?: boolean;
  penilai?: { id: number; nama: string };
}

/** Response /api/v1/penilaian/sempro/{id} */
export interface PenilaianSemproShowResponse {
  sempro: {
    id: number;
    status: string;
    periode?: string;
    mahasiswa: { id: number | null; nama: string; nim: string | null };
    judul?: string;
  };
  my_role: PenilaianRole;
  periode_aktif: boolean;
  my_nilai: PenilaianSemproDetail | null;
  all_nilai: PenilaianSemproDetail[];
}

/** Response /api/v1/penilaian/sidang/{id} */
export interface PenilaianSidangShowResponse {
  sidang: {
    id: number;
    status: string;
    periode?: string;
    mahasiswa: { id: number | null; nama: string; nim: string | null };
    judul?: string;
  };
  my_role: PenilaianRole;
  is_pembimbing: boolean;
  periode_aktif: boolean;
  my_nilai: PenilaianSidangDetail | null;
  all_nilai: PenilaianSidangDetail[];
}

// ==================== Periode ====================

// Backend menyimpan type & status dengan casing aslinya (lihat PeriodeResource).
export type PeriodeType = 'Sempro' | 'Seminar Proposal' | 'TA' | 'Sidang TA';
export type PeriodeStatus = 'Active' | 'Inactive';

/**
 * Sesuai backend PeriodeResource — field yang benar adalah `periode` (nama
 * periode, mis. "Genap 2024/2025"), `semester`, `gelombang`. Tidak ada
 * `nama`/`tanggal_mulai`/`tanggal_selesai` di response API.
 */
export interface Periode {
  id: number;
  semester?: string;
  periode?: string;
  gelombang?: string;
  type: PeriodeType;
  status: PeriodeStatus;
  is_tampilkan?: boolean;
  jadwal_sempro_count?: number;
  jadwal_ta_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PeriodeRequest {
  semester?: string;
  periode?: string;
  gelombang?: string;
  type: PeriodeType;
  status?: PeriodeStatus;
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
