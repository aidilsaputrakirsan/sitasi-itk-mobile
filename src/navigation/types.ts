import type { Bimbingan, PengajuanTA } from '../types';

export type AuthStackParamList = {
  Login: undefined;
};

export type MahasiswaTabParamList = {
  DashboardTab: undefined;
  BimbinganTab: undefined;
  AkademikTab: undefined;
  ProfilTab: undefined;
};

export type DosenTabParamList = {
  DashboardTab: undefined;
  BimbinganTab: undefined;
  AkademikTab: undefined;
  ProfilTab: undefined;
};

export type AdminTabParamList = {
  DashboardTab: undefined;
  KelolaTab: undefined;
  JadwalTab: undefined;
  ProfilTab: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  // Common
  MainTabs: undefined;
  Notifikasi: undefined;
  Katalog: undefined;
  KatalogDetail: { id: number };
  Jadwal: undefined;
  Profile: undefined;

  // Mahasiswa
  Bimbingan: undefined;
  BimbinganDetail: { id: number };
  BimbinganForm: { id?: number; data?: Bimbingan } | undefined;
  PengajuanTA: undefined;
  PengajuanTADetail: { id: number };
  PengajuanTAForm: { id?: number; data?: PengajuanTA } | undefined;
  Sempro: undefined;
  Sidang: undefined;

  // Dosen
  BimbinganDosen: undefined;
  PengajuanDosen: undefined;
  SemproDosen: undefined;
  SemproDosenDetail: { id: number };
  SidangDosen: undefined;

  // Admin
  UserManagement: undefined;
  UserDetail: { id: number };
  UserForm: { id?: number } | undefined;
  Periode: undefined;
  JadwalAdmin: undefined;
  KatalogAdmin: undefined;
};
