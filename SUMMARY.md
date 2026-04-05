# SITASI ITK Mobile — Panduan Pengembangan Lanjutan

> Dokumen ini menjelaskan kondisi codebase saat ini, arsitektur yang digunakan, apa yang sudah berjalan, dan apa yang perlu dikerjakan selanjutnya oleh tim mahasiswa.

---

## 1. Gambaran Proyek

**SITASI ITK Mobile** adalah aplikasi React Native (Expo SDK 54) yang mengonsumsi REST API dari backend Laravel SITASI-ITK (Sistem Informasi Tugas Akhir Institut Teknologi Kalimantan).

| Item | Detail |
|------|--------|
| Framework | React Native + Expo SDK 54 |
| Bahasa | TypeScript (strict mode) |
| State Management | Zustand |
| HTTP Client | Axios |
| Navigasi | React Navigation v7 (Stack + Bottom Tabs) |
| Secure Storage | `expo-secure-store` |
| File Upload | `expo-document-picker` |
| Backend | Laravel + Sanctum (Bearer Token) |
| API Base | `/api/v1` |

---

## 2. Cara Menjalankan Aplikasi

### 2.1 Prasyarat
- Node.js ≥ 18
- Expo CLI: `npm install -g expo-cli`
- HP fisik dengan **Expo Go** (App Store / Play Store) ATAU emulator Android/iOS
- Backend Laravel sudah running

### 2.2 Setup Backend
```bash
# Masuk ke folder backend
cd C:\laragon\www\Materi-Presentasi\sitasi-itk

# Jalankan backend di port 8000
php artisan serve
```
> Jika menggunakan Laragon, pastikan service sudah Start All.

### 2.3 Setup Mobile
```bash
# Install dependencies
npm install

# Jalankan Expo
npx expo start
```

Setelah QR muncul:
- **HP Fisik** → buka Expo Go → scan QR
- **Android Emulator** → tekan `a`
- **iOS Simulator** (Mac) → tekan `i`

### 2.4 Konfigurasi URL API

Buka file **`src/config/env.ts`** dan ubah `DEV_API_URL` sesuai IP komputer Anda:

```ts
const DEV_API_URL = 'http://192.168.X.X:8000/api/v1';
```

Cari IP Anda: buka terminal → ketik `ipconfig` (Windows) atau `ifconfig` (Mac/Linux).

> **PENTING**: Jangan ubah `PROD_API_URL`. URL production disimpan di `.env.local` yang sudah ter-ignore git sehingga tidak ikut ke repository.

---

## 3. Struktur Folder

```
sitasi-itk-mobile/
├── src/
│   ├── api/
│   │   ├── client.ts              ← Axios instance + interceptors
│   │   └── endpoints/             ← Semua fungsi pemanggil API
│   │       ├── auth.ts
│   │       ├── bimbingan.ts
│   │       ├── dashboard.ts
│   │       ├── jadwal.ts
│   │       ├── katalog.ts
│   │       ├── notifikasi.ts
│   │       ├── pengajuanTA.ts
│   │       ├── periode.ts
│   │       ├── sempro.ts
│   │       ├── sidang.ts
│   │       └── users.ts
│   │
│   ├── config/
│   │   └── env.ts                 ← URL API & konstanta (EDIT DI SINI)
│   │
│   ├── types/
│   │   └── index.ts               ← Semua TypeScript interface & type
│   │
│   ├── utils/
│   │   └── storage.ts             ← Wrapper expo-secure-store (token)
│   │
│   ├── stores/
│   │   └── authStore.ts           ← Zustand: auth state, login, logout
│   │
│   ├── hooks/
│   │   └── useNotification.ts     ← Polling notifikasi 30 detik
│   │
│   ├── navigation/
│   │   ├── types.ts               ← RootStackParamList & tab param lists
│   │   ├── AppNavigator.tsx       ← Root navigator (login vs main)
│   │   ├── MahasiswaNavigator.tsx ← Bottom tabs untuk mahasiswa
│   │   ├── DosenNavigator.tsx     ← Bottom tabs untuk dosen
│   │   └── AdminNavigator.tsx     ← Bottom tabs untuk tendik/koorpro
│   │
│   ├── components/
│   │   └── ui/
│   │       ├── LoadingScreen.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorMessage.tsx
│   │       └── StatusBadge.tsx
│   │
│   └── screens/
│       ├── auth/
│       │   └── LoginScreen.tsx
│       ├── common/
│       │   ├── DashboardScreen.tsx    ← Berbeda per role
│       │   ├── ProfileScreen.tsx
│       │   ├── NotifikasiScreen.tsx
│       │   ├── KatalogScreen.tsx
│       │   ├── KatalogDetailScreen.tsx
│       │   └── JadwalScreen.tsx
│       ├── mahasiswa/
│       │   ├── BimbinganScreen.tsx
│       │   ├── BimbinganDetailScreen.tsx
│       │   ├── BimbinganFormScreen.tsx
│       │   ├── PengajuanTAScreen.tsx
│       │   ├── PengajuanTADetailScreen.tsx
│       │   ├── PengajuanTAFormScreen.tsx
│       │   ├── SemproScreen.tsx       ← Status + daftar sempro
│       │   └── SidangScreen.tsx       ← Status + daftar sidang
│       ├── dosen/
│       │   ├── BimbinganDosenScreen.tsx   ← Approve/reject bimbingan
│       │   ├── PengajuanDosenScreen.tsx   ← Approve/reject pengajuan TA
│       │   ├── SemproDosenScreen.tsx      ← Kelola revisi sempro
│       │   └── SidangDosenScreen.tsx      ← Kelola revisi sidang
│       └── admin/
│           ├── UserManagementScreen.tsx
│           ├── UserDetailScreen.tsx
│           ├── PeriodeScreen.tsx
│           ├── JadwalAdminScreen.tsx
│           └── KatalogAdminScreen.tsx
│
├── App.tsx                        ← Entry point, init auth
├── index.ts                       ← Expo registerRootComponent
├── app.json                       ← Konfigurasi Expo
├── .env.local                     ← URL production (JANGAN COMMIT)
└── SUMMARY.md                     ← File ini
```

---

## 4. Alur Autentikasi

```
App start
  └─ authStore.initialize()
       ├─ Ada token di SecureStore?
       │    ├─ Ya → panggil GET /auth/me untuk verifikasi
       │    │         ├─ Valid   → tampilkan MainTabs
       │    │         └─ Invalid → hapus token, tampilkan Login
       │    └─ Tidak → tampilkan Login
       │
       └─ Login berhasil:
            ├─ Simpan token ke SecureStore (bukan AsyncStorage!)
            ├─ Simpan expires_at
            ├─ Simpan data user
            └─ Navigasi otomatis ke MainTabs (sesuai role)
```

**Role → Navigasi:**
| Role | Bottom Tabs yang Muncul |
|------|------------------------|
| `mahasiswa` | Dashboard, Bimbingan, Akademik, Profil |
| `dosen` | Dashboard, Bimbingan, Akademik, Profil |
| `tendik` / `koorpro` | Dashboard, Kelola, Jadwal, Profil |

---

## 5. Pola Pengembangan (Cara Menambah Fitur Baru)

### 5.1 Menambah Endpoint API Baru

Buka file yang relevan di `src/api/endpoints/` lalu tambahkan fungsi:

```ts
// Contoh di src/api/endpoints/bimbingan.ts
export const bimbinganApi = {
  // ... yang sudah ada ...

  // Tambahkan fungsi baru:
  getStats() {
    return api.get<ApiResponse<{ total: number }>>('/bimbingan/stats');
  },
};
```

### 5.2 Menambah Screen Baru

**Langkah 1** — Buat file screen di folder yang sesuai:
```tsx
// src/screens/mahasiswa/NamaScreen.tsx
import React from 'react';
import { View, Text } from 'react-native';

export function NamaScreen() {
  return (
    <View>
      <Text>Konten screen</Text>
    </View>
  );
}
```

**Langkah 2** — Daftarkan ke `RootStackParamList` di `src/navigation/types.ts`:
```ts
export type RootStackParamList = {
  // ... yang sudah ada ...
  NamaScreen: undefined;               // tanpa parameter
  NamaDetail: { id: number };          // dengan parameter
};
```

**Langkah 3** — Daftarkan ke `AppNavigator.tsx`:
```tsx
import { NamaScreen } from '../screens/mahasiswa/NamaScreen';

// Di dalam Stack.Navigator:
<Stack.Screen name="NamaScreen" component={NamaScreen} options={{ title: 'Judul Header' }} />
```

**Langkah 4** — Navigate dari screen lain:
```tsx
navigation.navigate('NamaScreen');
navigation.navigate('NamaDetail', { id: 5 });
```

### 5.3 Menggunakan Typed Props untuk Screen

Selalu gunakan `NativeStackScreenProps` agar route params type-safe:

```tsx
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'NamaDetail'>;

export function NamaDetailScreen({ route, navigation }: Props) {
  const { id } = route.params; // otomatis ter-type
}
```

### 5.4 Pola Fetch Data (List dengan Infinite Scroll)

```tsx
const [items, setItems] = useState<TipeData[]>([]);
const [meta, setMeta] = useState<PaginationMeta | null>(null);
const [loading, setLoading] = useState(true);
const [loadingMore, setLoadingMore] = useState(false);

const fetchData = useCallback(async (page = 1, append = false) => {
  const response = await someApi.list({ page, per_page: 15 });
  if (response.data.success) {
    setItems(append ? (prev) => [...prev, ...response.data.data] : response.data.data);
    setMeta(response.data.meta);
  }
}, []);

const onEndReached = () => {
  if (!meta || meta.current_page >= meta.last_page || loadingMore) return;
  setLoadingMore(true);
  fetchData(meta.current_page + 1, true);
};
```

### 5.5 Pola Upload File

```tsx
import * as DocumentPicker from 'expo-document-picker';

const pickAndUpload = async () => {
  const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
  if (result.canceled) return;

  const file = result.assets[0];
  const formData = new FormData();
  formData.append('nama_field', {
    uri: file.uri,
    type: file.mimeType ?? 'application/pdf',
    name: file.name ?? 'file.pdf',
  } as unknown as Blob);

  await someApi.upload(formData);
};
```

---

## 6. Yang Sudah Berjalan ✅

| Fitur | Screen | Status |
|-------|--------|--------|
| Login + auto-refresh token | `LoginScreen` | ✅ |
| Dashboard per role (mahasiswa/dosen/admin) | `DashboardScreen` | ✅ |
| Profil + ubah password + upload foto | `ProfileScreen` | ✅ |
| Notifikasi (list, mark read, delete, polling) | `NotifikasiScreen` | ✅ |
| Katalog TA (public, search, detail) | `KatalogScreen` | ✅ |
| Jadwal saya (sempro + sidang) | `JadwalScreen` | ✅ |
| Bimbingan mahasiswa (CRUD) | `BimbinganScreen` | ✅ |
| Bimbingan dosen (approve/reject) | `BimbinganDosenScreen` | ✅ |
| Pengajuan TA mahasiswa (CRUD) | `PengajuanTAScreen` | ✅ |
| Pengajuan TA dosen (approve/reject) | `PengajuanDosenScreen` | ✅ |
| Sempro mahasiswa (daftar + status) | `SemproScreen` | ✅ |
| Sempro dosen (kelola revisi) | `SemproDosenScreen` | ✅ |
| Sidang mahasiswa (daftar + status) | `SidangScreen` | ✅ |
| Sidang dosen (kelola revisi) | `SidangDosenScreen` | ✅ |
| Kelola User admin (list, detail, hapus, reset) | `UserManagementScreen` | ✅ |
| Detail User admin | `UserDetailScreen` | ✅ |
| Kelola Periode admin | `PeriodeScreen` | ✅ |
| Kelola Jadwal admin | `JadwalAdminScreen` | ✅ |
| Kelola Katalog admin (approve/reject) | `KatalogAdminScreen` | ✅ |

---

## 7. Yang Perlu Dikerjakan Selanjutnya 🔧

### 7.1 Prioritas Tinggi — Fitur Belum Lengkap

#### A. Screen Detail yang Belum Ada
Beberapa screen detail belum dibuat dan navigasinya akan error jika di-tap:

| Screen yang Dibutuhkan | Dari mana dipanggil | Parameter |
|------------------------|---------------------|-----------|
| `SemproDosenDetail` | `SemproDosenScreen` (tap card) | `{ id: number }` |
| `UserForm` | `UserManagementScreen` (tombol +) | `{ id?: number }` |

**Cara membuat**: lihat contoh `UserDetailScreen.tsx` sebagai template.

#### B. Mahasiswa: Update Dokumen Sempro/Sidang saat Revision
Saat status sempro/sidang adalah `revision`, mahasiswa perlu bisa upload ulang dokumen.
- **File**: `SemproScreen.tsx` dan `SidangScreen.tsx`
- **Endpoint**: `PUT /sempro/{id}` dan `PUT /sidang/{id}` (multipart)
- **Yang perlu ditambah**: tombol "Upload Ulang Dokumen" yang muncul saat `status === 'revision' || status === 'on_process'`

#### C. Mahasiswa: Buat Katalog TA
Setelah semua revisi selesai, mahasiswa bisa membuat entri katalog.
- **Endpoint**: `POST /katalog` dan `GET /katalog/my-katalog`
- **Field**: `judul`, `abstrak`, `kata_kunci`
- **Screen baru**: `KatalogMahasiswaScreen.tsx` di folder `screens/mahasiswa/`
- **Trigger**: cek `can_create_katalog` dari response dashboard

#### D. Jadwal Admin — Fitur Tambah/Edit Jadwal
`JadwalAdminScreen` baru menampilkan list. Belum ada form untuk menambah/mengatur jadwal sempro & sidang.

### 7.2 Prioritas Sedang — Penyempurnaan UI/UX

#### A. Desain Tab Bar Kustom
Navigator sudah menggunakan `CustomTabBar` (diimport) tapi komponen tersebut **belum dibuat**. Buat file:
```
src/components/ui/CustomTabBar.tsx
```
Jika belum siap, ganti sementara dengan tab bar default di ketiga Navigator:
```tsx
// Hapus: tabBar={(props) => <CustomTabBar {...props} />}
// Biarkan kosong agar pakai default
```

#### B. Error Handling yang Lebih Baik
Saat ini error hanya ditampilkan via `Alert.alert`. Idealnya tambahkan:
- Toast notification untuk aksi sukses (approve, reject, dll)
- Inline error di bawah form field untuk validation errors (422)
- Retry button di setiap list screen saat network error

#### C. Loading State per Aksi
Tombol approve/reject/submit perlu menampilkan `ActivityIndicator` saat loading (beberapa sudah ada, periksa yang belum).

#### D. Empty State yang Lebih Informatif
Tambahkan pesan berbeda tergantung konteks. Contoh di `BimbinganScreen`:
- Jika belum pernah bimbingan: "Belum ada bimbingan. Tap + untuk membuat bimbingan baru."
- Jika filter aktif tapi tidak ada hasil: "Tidak ada bimbingan dengan status ini."

### 7.3 Prioritas Rendah — Fitur Tambahan

#### A. Push Notification (opsional)
Saat ini notifikasi menggunakan polling 30 detik. Untuk real-time bisa menggunakan:
- `expo-notifications` untuk local/push notification
- Integrasi dengan Firebase Cloud Messaging (FCM)

#### B. Offline Caching
Simpan data terakhir di AsyncStorage sebagai cache saat offline:
```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
// AsyncStorage boleh dipakai untuk cache data non-sensitif
// Jangan gunakan untuk menyimpan token!
```

#### C. Dark Mode
Gunakan `useColorScheme()` dari React Native untuk mendukung tema gelap.

---

## 8. Catatan Penting Backend

### 8.1 Field Name Mapping (Frontend ↔ Backend)

Beberapa field nama berbeda antara yang tertulis di dokumentasi awal vs yang sebenarnya dikembalikan backend:

| Endpoint | Field Dokumentasi | Field Nyata di Response |
|----------|-------------------|------------------------|
| `GET /jadwal/sempro` | `tanggal` | `tanggal_sempro` |
| `GET /jadwal/sidang` | `tanggal` | `tanggal_sidang` |
| `GET /jadwal/my-schedule` | `{ sempro[], sidang[] }` | `{ jadwal_sempro, jadwal_sidang }` |
| `GET /periode` | `tanggal_mulai`, `tanggal_selesai` | `periode`, `semester`, `gelombang` |
| `GET /users` | `roles: string[]` | `roles: [{id, name, guard_name}]` (raw object) |
| `GET /users/{id}` | `roles: string[]` | `roles: string[]` (via UserResource) |

### 8.2 Status Values

| Model | Status Values di Backend |
|-------|--------------------------|
| Bimbingan | `created`, `approved`, `rejected` |
| PengajuanTA | `pending`, `approved`, `rejected`, `revision` |
| Sempro | `on_process`, `approved`, `rejected`, `revision`, `scheduled` |
| Sidang | `on_process`, `Diterima`, `Ditolak`, `revision`, `scheduled` |
| Periode | `Active`, `Nonactive` (**huruf besar**, bukan `active`) |

### 8.3 Endpoint yang Perlu Diverifikasi

Beberapa endpoint diimplementasikan berdasarkan dokumentasi awal namun **belum ditest**. Harap verifikasi response-nya dengan backend:

- `POST /sempro` — pastikan field name form yang dikirim sesuai
- `POST /sidang` — sama seperti sempro
- `GET /sempro/my-status` — pastikan struktur `{ registered, sempro }` sesuai
- `GET /sidang/my-status` — sama seperti sempro
- `POST /katalog` — verifikasi field yang diperlukan

---

## 9. Cara Debug & Troubleshooting

### `[object Object]` di layar
Berarti ada nilai object yang di-render langsung sebagai string. Cek:
1. Buka controller Laravel yang relevan
2. Lihat field apa saja yang dikembalikan
3. Sesuaikan rendering di screen TypeScript

### `Invalid Date` di layar
Field tanggal yang di-render tidak sesuai nama. Cek nama field asli dari Resource Laravel (misal `tanggal_sempro` bukan `tanggal`).

### `NAVIGATE not handled`
Screen belum didaftarkan di `AppNavigator.tsx`. Tambahkan:
```tsx
<Stack.Screen name="NamaScreen" component={NamaScreenComponent} options={{ title: '...' }} />
```
Dan pastikan nama screen sudah ada di `RootStackParamList` di `src/navigation/types.ts`.

### Tidak bisa connect ke API
1. Pastikan `php artisan serve` running
2. Pastikan IP di `env.ts` adalah IP komputer di jaringan yang sama dengan HP
3. Pastikan HP dan komputer tersambung WiFi yang sama
4. Coba akses `http://IP:8000/api/v1/katalog` di browser HP

### TypeScript error
Jalankan `npx tsc --noEmit` di terminal untuk melihat semua error sekaligus.

---

## 10. Keamanan — Hal yang DILARANG

| ❌ Jangan | ✅ Gantinya |
|-----------|------------|
| Simpan token di `AsyncStorage` | Gunakan `expo-secure-store` via `src/utils/storage.ts` |
| Hardcode URL production di kode | Gunakan `.env.local` (sudah di-setup) |
| Commit file `.env.local` | File ini sudah di-ignore git secara otomatis |
| Langsung test dengan akun production | Gunakan akun development / data dummy |
| Push ke branch `main` langsung | Buat branch fitur, lalu pull request |

---

## 11. Referensi

| Sumber | Link |
|--------|------|
| Expo Documentation | https://docs.expo.dev |
| React Navigation | https://reactnavigation.org/docs |
| Zustand | https://zustand.docs.pmnd.rs |
| Axios | https://axios-http.com/docs/intro |
| expo-secure-store | https://docs.expo.dev/versions/latest/sdk/securestore |
| expo-document-picker | https://docs.expo.dev/versions/latest/sdk/document-picker |

---

*Dokumen ini dibuat bersamaan dengan versi awal integrasi API. Harap diperbarui setiap ada perubahan signifikan pada arsitektur atau endpoint.*
