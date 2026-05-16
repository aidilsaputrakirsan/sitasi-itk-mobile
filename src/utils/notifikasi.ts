import type { Notifikasi } from '../types';

/**
 * Backend NotifikasiResource mengirim `type` (event slug) + `data` (payload bebas).
 * Karena tidak ada `title`/`message` literal, kita derive di sini:
 *   - title    : `data.title` jika ada, fallback ke slug yang diformat
 *   - message  : `data.message` jika ada, fallback ke '-'
 *   - subtitle : detail seperti judul TA / nama mahasiswa kalau tersedia di data
 */
export interface FormattedNotifikasi {
  title: string;
  message: string;
  subtitle?: string;
}

export function formatNotifikasi(n: Notifikasi): FormattedNotifikasi {
  const data = (n.data ?? {}) as Record<string, unknown>;
  const title =
    asString(data.title) ?? humanizeType(n.type) ?? 'Notifikasi';
  const message = asString(data.message) ?? asString(data.body) ?? '-';
  const subtitle =
    asString(data.judul) ??
    asString(data.judul_ta) ??
    asString(data.nama_mahasiswa) ??
    undefined;
  return { title, message, subtitle };
}

function asString(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

function humanizeType(type?: string): string | undefined {
  if (!type) return undefined;
  return type
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
