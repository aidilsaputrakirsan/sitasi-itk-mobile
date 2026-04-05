/**
 * Konfigurasi environment aplikasi SITASI ITK Mobile
 *
 * DEV  → otomatis aktif saat `expo start` (flag __DEV__ = true)
 * PROD → aktif saat build production (`expo build` / `eas build`)
 *
 * URL production disimpan di .env.local (ter-ignore git).
 * Mahasiswa hanya perlu ubah DEV_API_URL sesuai IP lokal masing-masing.
 */

// ── URL yang boleh diubah mahasiswa ──────────────────────────────────────────

/** Ganti dengan IP komputer Anda saat development (jalankan: ipconfig/ifconfig) */
const DEV_API_URL = 'http://192.168.18.12:8000/api/v1';

// ── URL production — jangan hardcode di sini ─────────────────────────────────
// Diambil dari .env.local (file ini di-ignore git, tidak ikut ke repository)
const PROD_API_URL =
  process.env.EXPO_PUBLIC_API_URL_PRODUCTION ??
  'https://sitasi-itk.myst-tech.com/api/v1'; // fallback jika .env.local tidak ada

// ─────────────────────────────────────────────────────────────────────────────

const config = {
  API_BASE_URL: __DEV__ ? DEV_API_URL : PROD_API_URL,

  /** Auto-refresh token jika sisa waktu < 1 jam */
  TOKEN_REFRESH_THRESHOLD_MS: 60 * 60 * 1000,

  /** Interval polling notifikasi (30 detik) */
  NOTIFICATION_POLL_INTERVAL_MS: 30 * 1000,

  MAX_PER_PAGE: 100,
  DEFAULT_PER_PAGE: 15,
};

export default config;
