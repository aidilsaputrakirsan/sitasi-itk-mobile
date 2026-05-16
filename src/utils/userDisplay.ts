import type { User } from '../types';

/**
 * Ambil nama tampilan user dengan urutan prioritas yang benar:
 *   1. dosen.nama_dosen   (jika user adalah dosen)
 *   2. mahasiswa.nama     (jika user adalah mahasiswa)
 *   3. user.name          (fallback default Laravel)
 */
export function getUserDisplayName(user?: Pick<User, 'name' | 'mahasiswa' | 'dosen'> | null): string {
  if (!user) return '-';
  return (
    user.dosen?.nama_dosen ??
    user.mahasiswa?.nama ??
    user.name ??
    '-'
  );
}

/**
 * Ambil identifier (NIM untuk mahasiswa, NIP untuk dosen).
 */
export function getUserIdentifier(user?: Pick<User, 'nim' | 'nip' | 'mahasiswa' | 'dosen'> | null): string {
  if (!user) return '-';
  return (
    user.mahasiswa?.nim ??
    user.nim ??
    user.nip ??
    '-'
  );
}

/**
 * Label peran utama user — sesuai urutan prioritas di authStore.
 */
export function getUserRoleLabel(roles?: string[] | null): string {
  if (!roles?.length) return '-';
  const priority: Record<string, number> = {
    mahasiswa: 1,
    dosen: 2,
    koorpro: 3,
    tendik: 4,
  };
  const sorted = [...roles].sort((a, b) => (priority[a] ?? 99) - (priority[b] ?? 99));
  return sorted[0].toUpperCase();
}
