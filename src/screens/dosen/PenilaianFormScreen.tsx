import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { penilaianApi } from '../../api/endpoints/penilaian';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import type {
  PenilaianRole,
  PenilaianSemproForm,
  PenilaianSemproShowResponse,
  PenilaianSidangForm,
  PenilaianSidangShowResponse,
} from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PenilaianForm'>;

// ── Definisi field per kriteria ────────────────────────────────────────────────
// Bobot ini hanya untuk display; kalkulasi resmi datang dari server (formatNilai*)

type FieldDef = { key: keyof PenilaianSidangForm; label: string };

const KRITERIA_SEMPRO: { title: string; bobot: number; fields: FieldDef[]; pembimbingOnly?: boolean }[] = [
  {
    title: 'Kriteria I — Penulisan',
    bobot: 15,
    fields: [
      { key: 'struktur_sistematika', label: 'Struktur & Sistematika' },
      { key: 'kepatuhan_format', label: 'Kepatuhan Format' },
    ],
  },
  {
    title: 'Kriteria II — Pemaparan',
    bobot: 30,
    fields: [
      { key: 'media_presentasi', label: 'Media Presentasi' },
      { key: 'komunikasi_verbal', label: 'Komunikasi Verbal' },
      { key: 'komunikasi_nonverbal', label: 'Komunikasi Non-Verbal' },
    ],
  },
  {
    title: 'Kriteria III — Substansi',
    bobot: 55,
    fields: [
      { key: 'pemahaman_materi', label: 'Pemahaman Materi' },
      { key: 'rumusan_masalah', label: 'Rumusan Masalah' },
      { key: 'relevansi_metode', label: 'Relevansi Metode' },
      { key: 'kelayakan_rencana', label: 'Kelayakan Rencana' },
      { key: 'relevansi_luaran', label: 'Relevansi Luaran' },
    ],
  },
];

const KRITERIA_SIDANG: { title: string; bobot: number; fields: FieldDef[]; pembimbingOnly?: boolean }[] = [
  {
    title: 'Kriteria I — Penulisan',
    bobot: 10,
    fields: [
      { key: 'struktur_sistematika', label: 'Struktur & Sistematika' },
      { key: 'kepatuhan_format', label: 'Kepatuhan Format' },
    ],
  },
  {
    title: 'Kriteria II — Pemaparan',
    bobot: 20,
    fields: [
      { key: 'media_presentasi', label: 'Media Presentasi' },
      { key: 'komunikasi_verbal', label: 'Komunikasi Verbal' },
      { key: 'komunikasi_nonverbal', label: 'Komunikasi Non-Verbal' },
    ],
  },
  {
    title: 'Kriteria III — Substansi',
    bobot: 55,
    fields: [
      { key: 'pemahaman_materi', label: 'Pemahaman Materi' },
      { key: 'rumusan_masalah', label: 'Rumusan Masalah' },
      { key: 'relevansi_metode', label: 'Relevansi Metode' },
      { key: 'kelayakan_rencana', label: 'Kelayakan Rencana' },
      { key: 'relevansi_luaran', label: 'Relevansi Luaran' },
    ],
  },
  {
    title: 'Kriteria IV — Profesionalisme',
    bobot: 15,
    pembimbingOnly: true,
    fields: [
      { key: 'etika_komunikasi', label: 'Etika Komunikasi' },
      { key: 'kemandirian_daya_juang', label: 'Kemandirian & Daya Juang' },
    ],
  },
];

// Default state — all empty strings (kalau belum diisi)
const EMPTY_SEMPRO: Record<keyof PenilaianSemproForm, string> = {
  struktur_sistematika: '',
  kepatuhan_format: '',
  media_presentasi: '',
  komunikasi_verbal: '',
  komunikasi_nonverbal: '',
  pemahaman_materi: '',
  rumusan_masalah: '',
  relevansi_metode: '',
  kelayakan_rencana: '',
  relevansi_luaran: '',
};

const EMPTY_SIDANG: Record<keyof PenilaianSidangForm, string> = {
  ...EMPTY_SEMPRO,
  etika_komunikasi: '',
  kemandirian_daya_juang: '',
};

const ROLE_LABEL: Record<PenilaianRole, string> = {
  pembimbing_1: 'Pembimbing 1',
  pembimbing_2: 'Pembimbing 2',
  penguji_1: 'Penguji 1',
  penguji_2: 'Penguji 2',
};

export function PenilaianFormScreen({ route, navigation }: Props) {
  const { type, targetId } = route.params;
  const isSidang = type === 'sidang';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [semproData, setSemproData] = useState<PenilaianSemproShowResponse | null>(null);
  const [sidangData, setSidangData] = useState<PenilaianSidangShowResponse | null>(null);

  // Form state — pakai string supaya TextInput kontrol penuh
  const [values, setValues] = useState<Record<string, string>>(
    isSidang ? { ...EMPTY_SIDANG } : { ...EMPTY_SEMPRO }
  );
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // ── Load data ────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isSidang) {
        const res = await penilaianApi.showSidang(targetId);
        if (res.data.success) {
          setSidangData(res.data.data);
          if (res.data.data.my_nilai) {
            const n = res.data.data.my_nilai;
            setValues({
              struktur_sistematika: String(n.struktur_sistematika),
              kepatuhan_format: String(n.kepatuhan_format),
              media_presentasi: String(n.media_presentasi),
              komunikasi_verbal: String(n.komunikasi_verbal),
              komunikasi_nonverbal: String(n.komunikasi_nonverbal),
              pemahaman_materi: String(n.pemahaman_materi),
              rumusan_masalah: String(n.rumusan_masalah),
              relevansi_metode: String(n.relevansi_metode),
              kelayakan_rencana: String(n.kelayakan_rencana),
              relevansi_luaran: String(n.relevansi_luaran),
              etika_komunikasi: String(n.etika_komunikasi),
              kemandirian_daya_juang: String(n.kemandirian_daya_juang),
            });
          }
        }
      } else {
        const res = await penilaianApi.showSempro(targetId);
        if (res.data.success) {
          setSemproData(res.data.data);
          if (res.data.data.my_nilai) {
            const n = res.data.data.my_nilai;
            setValues({
              struktur_sistematika: String(n.struktur_sistematika),
              kepatuhan_format: String(n.kepatuhan_format),
              media_presentasi: String(n.media_presentasi),
              komunikasi_verbal: String(n.komunikasi_verbal),
              komunikasi_nonverbal: String(n.komunikasi_nonverbal),
              pemahaman_materi: String(n.pemahaman_materi),
              rumusan_masalah: String(n.rumusan_masalah),
              relevansi_metode: String(n.relevansi_metode),
              kelayakan_rencana: String(n.kelayakan_rencana),
              relevansi_luaran: String(n.relevansi_luaran),
            });
          }
        }
      }
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? 'Gagal memuat data penilaian');
    } finally {
      setLoading(false);
    }
  }, [isSidang, targetId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Header info ──────────────────────────────────────────────────────────────
  const header = useMemo(() => {
    if (isSidang && sidangData) {
      return {
        mahasiswa: sidangData.sidang.mahasiswa.nama,
        nim: sidangData.sidang.mahasiswa.nim ?? '-',
        judul: sidangData.sidang.judul,
        role: sidangData.my_role,
        isPembimbing: sidangData.is_pembimbing,
        periodeAktif: sidangData.periode_aktif,
        editing: !!sidangData.my_nilai,
      };
    }
    if (!isSidang && semproData) {
      return {
        mahasiswa: semproData.sempro.mahasiswa.nama,
        nim: semproData.sempro.mahasiswa.nim ?? '-',
        judul: semproData.sempro.judul,
        role: semproData.my_role,
        isPembimbing: false,
        periodeAktif: semproData.periode_aktif,
        editing: !!semproData.my_nilai,
      };
    }
    return null;
  }, [isSidang, semproData, sidangData]);

  // ── Hitung total nilai (preview lokal) ───────────────────────────────────────
  const totalPreview = useMemo(() => {
    const num = (k: string) => {
      const v = parseFloat(values[k]);
      return isNaN(v) ? 0 : v;
    };
    if (isSidang) {
      const k1 = (num('struktur_sistematika') + num('kepatuhan_format')) / 2;
      const k2 = (num('media_presentasi') + num('komunikasi_verbal') + num('komunikasi_nonverbal')) / 3;
      const k3 = (num('pemahaman_materi') + num('rumusan_masalah') + num('relevansi_metode') + num('kelayakan_rencana') + num('relevansi_luaran')) / 5;
      const k4 = (num('etika_komunikasi') + num('kemandirian_daya_juang')) / 2;

      if (header?.isPembimbing) {
        // Bobot pembimbing: 10/20/55/15
        const total = (k1 * 10 + k2 * 20 + k3 * 55 + k4 * 15) / 100;
        return { k1, k2, k3, k4, total };
      }
      // Bobot penguji (tanpa K4): rasio 10/20/55 dari total 85
      const total = (k1 * 10 + k2 * 20 + k3 * 55) / 85;
      return { k1, k2, k3, k4: null, total };
    }

    // Sempro
    const k1 = (num('struktur_sistematika') + num('kepatuhan_format')) / 2;
    const k2 = (num('media_presentasi') + num('komunikasi_verbal') + num('komunikasi_nonverbal')) / 3;
    const k3 = (num('pemahaman_materi') + num('rumusan_masalah') + num('relevansi_metode') + num('kelayakan_rencana') + num('relevansi_luaran')) / 5;
    const total = (k1 * 15 + k2 * 30 + k3 * 55) / 100;
    return { k1, k2, k3, k4: null, total };
  }, [values, isSidang, header]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const setField = (key: string, raw: string) => {
    // Allow only digits + optional decimal
    const sanitized = raw.replace(/[^0-9.]/g, '');
    setValues((prev) => ({ ...prev, [key]: sanitized }));
    if (errors[key]) {
      const next = { ...errors };
      delete next[key];
      setErrors(next);
    }
  };

  const validateLocal = (): boolean => {
    const requiredKeys: string[] = [
      'struktur_sistematika', 'kepatuhan_format',
      'media_presentasi', 'komunikasi_verbal', 'komunikasi_nonverbal',
      'pemahaman_materi', 'rumusan_masalah', 'relevansi_metode', 'kelayakan_rencana', 'relevansi_luaran',
    ];
    if (isSidang && header?.isPembimbing) {
      requiredKeys.push('etika_komunikasi', 'kemandirian_daya_juang');
    }
    const newErrors: Record<string, string[]> = {};
    for (const k of requiredKeys) {
      const raw = values[k];
      if (raw === '' || raw === undefined) {
        newErrors[k] = ['Wajib diisi'];
        continue;
      }
      const v = parseFloat(raw);
      if (isNaN(v) || v < 0 || v > 100) {
        newErrors[k] = ['Harus angka 0–100'];
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!header?.periodeAktif) {
      Alert.alert('Periode Tidak Aktif', `Tidak ada periode ${isSidang ? 'Sidang TA' : 'Seminar Proposal'} yang aktif. Penilaian ditutup.`);
      return;
    }
    if (!validateLocal()) {
      Alert.alert('Form belum lengkap', 'Silakan periksa kembali field yang ditandai.');
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      if (isSidang) {
        const payload: PenilaianSidangForm = {
          struktur_sistematika: parseFloat(values.struktur_sistematika),
          kepatuhan_format: parseFloat(values.kepatuhan_format),
          media_presentasi: parseFloat(values.media_presentasi),
          komunikasi_verbal: parseFloat(values.komunikasi_verbal),
          komunikasi_nonverbal: parseFloat(values.komunikasi_nonverbal),
          pemahaman_materi: parseFloat(values.pemahaman_materi),
          rumusan_masalah: parseFloat(values.rumusan_masalah),
          relevansi_metode: parseFloat(values.relevansi_metode),
          kelayakan_rencana: parseFloat(values.kelayakan_rencana),
          relevansi_luaran: parseFloat(values.relevansi_luaran),
          etika_komunikasi: header?.isPembimbing ? parseFloat(values.etika_komunikasi) : 0,
          kemandirian_daya_juang: header?.isPembimbing ? parseFloat(values.kemandirian_daya_juang) : 0,
        };
        await penilaianApi.storeSidang(targetId, payload);
      } else {
        const payload: PenilaianSemproForm = {
          struktur_sistematika: parseFloat(values.struktur_sistematika),
          kepatuhan_format: parseFloat(values.kepatuhan_format),
          media_presentasi: parseFloat(values.media_presentasi),
          komunikasi_verbal: parseFloat(values.komunikasi_verbal),
          komunikasi_nonverbal: parseFloat(values.komunikasi_nonverbal),
          pemahaman_materi: parseFloat(values.pemahaman_materi),
          rumusan_masalah: parseFloat(values.rumusan_masalah),
          relevansi_metode: parseFloat(values.relevansi_metode),
          kelayakan_rencana: parseFloat(values.kelayakan_rencana),
          relevansi_luaran: parseFloat(values.relevansi_luaran),
        };
        await penilaianApi.storeSempro(targetId, payload);
      }
      Alert.alert(
        'Berhasil',
        header?.editing ? 'Penilaian berhasil diperbarui' : 'Penilaian berhasil disimpan',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: unknown) {
      const e = err as { message?: string; errors?: Record<string, string[]> };
      if (e.errors) setErrors(e.errors);
      Alert.alert('Gagal', e.message ?? 'Terjadi kesalahan saat menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  if (loading) return <LoadingScreen />;
  if (error || !header) {
    return <ErrorMessage message={error ?? 'Data tidak tersedia'} onRetry={fetchData} />;
  }

  const kriteriaList = isSidang ? KRITERIA_SIDANG : KRITERIA_SEMPRO;

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header info */}
      <View style={styles.headerCard}>
        <Text style={styles.headerType}>
          Penilaian {isSidang ? 'Sidang TA' : 'Seminar Proposal'}
        </Text>
        <Text style={styles.headerName}>{header.mahasiswa}</Text>
        <Text style={styles.headerNim}>NIM: {header.nim}</Text>
        {header.judul && (
          <Text style={styles.headerJudul} numberOfLines={3}>{header.judul}</Text>
        )}
        <View style={styles.roleRow}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Sebagai {ROLE_LABEL[header.role]}</Text>
          </View>
          {header.editing && (
            <View style={[styles.roleBadge, styles.editBadge]}>
              <Text style={styles.editBadgeText}>Edit</Text>
            </View>
          )}
        </View>
        {!header.periodeAktif && (
          <View style={styles.warnBox}>
            <Text style={styles.warnText}>
              ⚠️ Periode {isSidang ? 'Sidang TA' : 'Seminar Proposal'} tidak aktif. Penilaian tidak dapat disimpan.
            </Text>
          </View>
        )}
      </View>

      {/* Form per kriteria */}
      {kriteriaList.map((kriteria) => {
        if (kriteria.pembimbingOnly && !header.isPembimbing) return null;
        return (
          <View key={kriteria.title} style={styles.kriteriaCard}>
            <View style={styles.kriteriaHeader}>
              <Text style={styles.kriteriaTitle}>{kriteria.title}</Text>
              <Text style={styles.kriteriaBobot}>{kriteria.bobot}%</Text>
            </View>
            {kriteria.fields.map((field) => (
              <View key={String(field.key)} style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <TextInput
                  style={[styles.input, errors[field.key] ? styles.inputError : null]}
                  value={values[field.key as string] ?? ''}
                  onChangeText={(t) => setField(field.key as string, t)}
                  keyboardType="numeric"
                  placeholder="0–100"
                  maxLength={6}
                  editable={!submitting && !!header.periodeAktif}
                />
                {errors[field.key]?.map((msg, i) => (
                  <Text key={i} style={styles.fieldError}>{msg}</Text>
                ))}
              </View>
            ))}
          </View>
        );
      })}

      {/* Total preview */}
      <View style={styles.totalCard}>
        <Text style={styles.totalTitle}>Pratinjau Nilai Anda</Text>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Kriteria I</Text>
          <Text style={styles.totalValue}>{totalPreview.k1.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Kriteria II</Text>
          <Text style={styles.totalValue}>{totalPreview.k2.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Kriteria III</Text>
          <Text style={styles.totalValue}>{totalPreview.k3.toFixed(2)}</Text>
        </View>
        {totalPreview.k4 !== null && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Kriteria IV</Text>
            <Text style={styles.totalValue}>{totalPreview.k4.toFixed(2)}</Text>
          </View>
        )}
        <View style={[styles.totalRow, styles.totalRowFinal]}>
          <Text style={styles.totalLabelFinal}>Total Nilai</Text>
          <Text style={styles.totalValueFinal}>{totalPreview.total.toFixed(2)}</Text>
        </View>
        <Text style={styles.totalNote}>
          * Pratinjau hanya untuk penilai ini. Nilai akhir mahasiswa = rata-rata semua penilai.
        </Text>
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, (submitting || !header.periodeAktif) && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={submitting || !header.periodeAktif}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>
            {header.editing ? 'Perbarui Nilai' : 'Simpan Nilai'}
          </Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },

  headerCard: {
    backgroundColor: '#0066CC',
    margin: 16,
    marginBottom: 12,
    padding: 18,
    borderRadius: 12,
  },
  headerType: { color: '#BBDEFB', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  headerName: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 6 },
  headerNim: { color: '#E3F2FD', fontSize: 13, marginTop: 2 },
  headerJudul: { color: '#fff', fontSize: 13, marginTop: 8, lineHeight: 18, fontStyle: 'italic' },
  roleRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  editBadge: { backgroundColor: '#FFB300' },
  editBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  warnBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  warnText: { color: '#E65100', fontSize: 12, fontWeight: '600' },

  kriteriaCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  kriteriaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  kriteriaTitle: { fontSize: 14, fontWeight: '700', color: '#333', flex: 1 },
  kriteriaBobot: { fontSize: 12, fontWeight: '700', color: '#0066CC', backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },

  fieldRow: { marginBottom: 12 },
  fieldLabel: { fontSize: 13, color: '#555', marginBottom: 6, fontWeight: '500' },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputError: { borderColor: '#CC0000', backgroundColor: '#FFEBEE' },
  fieldError: { color: '#CC0000', fontSize: 11, marginTop: 4 },

  totalCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  totalTitle: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 10 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  totalLabel: { fontSize: 13, color: '#666' },
  totalValue: { fontSize: 13, color: '#333', fontWeight: '600' },
  totalRowFinal: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabelFinal: { fontSize: 14, color: '#0066CC', fontWeight: '700' },
  totalValueFinal: { fontSize: 18, color: '#0066CC', fontWeight: '800' },
  totalNote: { fontSize: 11, color: '#999', marginTop: 8, fontStyle: 'italic' },

  submitBtn: {
    marginHorizontal: 16,
    backgroundColor: '#0066CC',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: '#9E9E9E' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
