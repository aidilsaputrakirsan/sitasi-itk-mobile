import api from '../client';
import type {
  ApiResponse,
  PenilaianSemproDetail,
  PenilaianSemproForm,
  PenilaianSemproShowResponse,
  PenilaianSidangDetail,
  PenilaianSidangForm,
  PenilaianSidangShowResponse,
} from '../../types';

export const penilaianApi = {
  /** GET nilai sempro: status periode, role saya, nilai saya, & nilai semua penilai */
  showSempro(semproId: number) {
    return api.get<ApiResponse<PenilaianSemproShowResponse>>(
      `/penilaian/sempro/${semproId}`
    );
  },

  /** Simpan/update nilai sempro untuk dosen yang sedang login */
  storeSempro(semproId: number, data: PenilaianSemproForm) {
    return api.post<ApiResponse<PenilaianSemproDetail>>(
      `/penilaian/sempro/${semproId}`,
      data
    );
  },

  /** GET nilai sidang TA */
  showSidang(sidangId: number) {
    return api.get<ApiResponse<PenilaianSidangShowResponse>>(
      `/penilaian/sidang/${sidangId}`
    );
  },

  /** Simpan/update nilai sidang. Untuk PEMBIMBING: wajib isi etika_komunikasi & kemandirian_daya_juang. */
  storeSidang(sidangId: number, data: PenilaianSidangForm) {
    return api.post<ApiResponse<PenilaianSidangDetail>>(
      `/penilaian/sidang/${sidangId}`,
      data
    );
  },
};
