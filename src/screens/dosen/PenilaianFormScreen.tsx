import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Button,
  Card,
  HelperText,
  Snackbar,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import {
  Award,
  CheckCircle2,
  FileText,
  GraduationCap,
  Pencil,
  Save,
  TriangleAlert,
} from 'lucide-react-native';
import { penilaianApi } from '../../api/endpoints/penilaian';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { palette } from '../../theme';
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

  const [values, setValues] = useState<Record<string, string>>(
    isSidang ? { ...EMPTY_SIDANG } : { ...EMPTY_SEMPRO }
  );
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [snack, setSnack] = useState<{ visible: boolean; message: string; variant: 'success' | 'error' }>({
    visible: false,
    message: '',
    variant: 'success',
  });
  const showSnack = (message: string, variant: 'success' | 'error') =>
    setSnack({ visible: true, message, variant });

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        const total = (k1 * 10 + k2 * 20 + k3 * 55 + k4 * 15) / 100;
        return { k1, k2, k3, k4, total };
      }
      const total = (k1 * 10 + k2 * 20 + k3 * 55) / 85;
      return { k1, k2, k3, k4: null, total };
    }
    const k1 = (num('struktur_sistematika') + num('kepatuhan_format')) / 2;
    const k2 = (num('media_presentasi') + num('komunikasi_verbal') + num('komunikasi_nonverbal')) / 3;
    const k3 = (num('pemahaman_materi') + num('rumusan_masalah') + num('relevansi_metode') + num('kelayakan_rencana') + num('relevansi_luaran')) / 5;
    const total = (k1 * 15 + k2 * 30 + k3 * 55) / 100;
    return { k1, k2, k3, k4: null, total };
  }, [values, isSidang, header]);

  const setField = (key: string, raw: string) => {
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
      showSnack(
        `Periode ${isSidang ? 'Sidang TA' : 'Seminar Proposal'} tidak aktif`,
        'error'
      );
      return;
    }
    if (!validateLocal()) {
      showSnack('Periksa kembali field yang ditandai', 'error');
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
      showSnack(header?.editing ? 'Penilaian berhasil diperbarui' : 'Penilaian berhasil disimpan', 'success');
      setTimeout(() => navigation.goBack(), 900);
    } catch (err: unknown) {
      const e = err as { message?: string; errors?: Record<string, string[]> };
      if (e.errors) setErrors(e.errors);
      showSnack(e.message ?? 'Terjadi kesalahan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (error || !header) {
    return <ErrorMessage message={error ?? 'Data tidak tersedia'} onRetry={fetchData} />;
  }

  const kriteriaList = isSidang ? KRITERIA_SIDANG : KRITERIA_SEMPRO;
  const disabled = submitting || !header.periodeAktif;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero header */}
        <Surface elevation={0} style={styles.hero}>
          <View style={styles.heroTop}>
            <Text variant="labelSmall" style={styles.heroLabel}>
              {isSidang ? 'PENILAIAN SIDANG TA' : 'PENILAIAN SEMINAR PROPOSAL'}
            </Text>
            {header.editing && (
              <Surface elevation={0} style={styles.editChip}>
                <Pencil size={12} color={palette.tertiary} strokeWidth={2.4} />
                <Text variant="labelSmall" style={styles.editChipText}>
                  Edit
                </Text>
              </Surface>
            )}
          </View>
          <Text variant="titleLarge" style={styles.heroName}>
            {header.mahasiswa}
          </Text>
          <Text variant="bodySmall" style={styles.heroNim}>
            NIM: {header.nim}
          </Text>
          {header.judul && (
            <Text variant="bodySmall" style={styles.heroJudul} numberOfLines={3}>
              {header.judul}
            </Text>
          )}
          <Surface elevation={0} style={styles.roleBadge}>
            <Award size={12} color="#fff" strokeWidth={2.4} />
            <Text variant="labelSmall" style={styles.roleBadgeText}>
              Anda sebagai {ROLE_LABEL[header.role]}
            </Text>
          </Surface>
        </Surface>

        {/* Warning kalau periode tidak aktif */}
        {!header.periodeAktif && (
          <Surface elevation={0} style={styles.warnBanner}>
            <TriangleAlert size={16} color={palette.warning} strokeWidth={2} />
            <Text variant="bodySmall" style={styles.warnText}>
              Periode {isSidang ? 'Sidang TA' : 'Seminar Proposal'} tidak aktif. Penilaian tidak dapat disimpan.
            </Text>
          </Surface>
        )}

        {/* Form per kriteria */}
        {kriteriaList.map((kriteria) => {
          if (kriteria.pembimbingOnly && !header.isPembimbing) return null;
          return (
            <Card key={kriteria.title} mode="elevated" style={styles.kriteriaCard}>
              <Card.Content>
                <View style={styles.kriteriaHeader}>
                  <View style={styles.kriteriaTitleRow}>
                    <FileText size={16} color={palette.primary} strokeWidth={2} />
                    <Text variant="titleSmall" style={styles.kriteriaTitle}>
                      {kriteria.title}
                    </Text>
                  </View>
                  <Surface elevation={0} style={styles.bobotChip}>
                    <Text variant="labelSmall" style={styles.bobotText}>
                      {kriteria.bobot}%
                    </Text>
                  </Surface>
                </View>
                {kriteria.fields.map((field) => (
                  <View key={String(field.key)} style={styles.fieldRow}>
                    <TextInput
                      mode="outlined"
                      label={field.label}
                      value={values[field.key as string] ?? ''}
                      onChangeText={(t) => setField(field.key as string, t)}
                      keyboardType="numeric"
                      placeholder="0–100"
                      maxLength={6}
                      error={!!errors[field.key as string]}
                      disabled={disabled}
                      style={styles.input}
                    />
                    {errors[field.key as string] && (
                      <HelperText type="error" visible>
                        {errors[field.key as string][0]}
                      </HelperText>
                    )}
                  </View>
                ))}
              </Card.Content>
            </Card>
          );
        })}

        {/* Total preview */}
        <Card mode="elevated" style={styles.totalCard}>
          <Card.Content>
            <View style={styles.totalHeader}>
              <CheckCircle2 size={18} color={palette.success} strokeWidth={2} />
              <Text variant="titleSmall" style={styles.totalTitle}>
                Pratinjau Nilai Anda
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text variant="bodyMedium" style={styles.totalLabel}>
                Kriteria I
              </Text>
              <Text variant="bodyMedium" style={styles.totalValue}>
                {totalPreview.k1.toFixed(2)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text variant="bodyMedium" style={styles.totalLabel}>
                Kriteria II
              </Text>
              <Text variant="bodyMedium" style={styles.totalValue}>
                {totalPreview.k2.toFixed(2)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text variant="bodyMedium" style={styles.totalLabel}>
                Kriteria III
              </Text>
              <Text variant="bodyMedium" style={styles.totalValue}>
                {totalPreview.k3.toFixed(2)}
              </Text>
            </View>
            {totalPreview.k4 !== null && (
              <View style={styles.totalRow}>
                <Text variant="bodyMedium" style={styles.totalLabel}>
                  Kriteria IV
                </Text>
                <Text variant="bodyMedium" style={styles.totalValue}>
                  {totalPreview.k4.toFixed(2)}
                </Text>
              </View>
            )}
            <View style={styles.totalDivider} />
            <View style={styles.totalRowFinal}>
              <View style={styles.totalFinalLeft}>
                <GraduationCap size={18} color={palette.primary} strokeWidth={2} />
                <Text variant="titleMedium" style={styles.totalLabelFinal}>
                  Total Nilai
                </Text>
              </View>
              <Text variant="headlineSmall" style={styles.totalValueFinal}>
                {totalPreview.total.toFixed(2)}
              </Text>
            </View>
            <Text variant="labelSmall" style={styles.totalNote}>
              Pratinjau hanya untuk penilai ini. Nilai akhir mahasiswa = rata-rata semua penilai.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Submit sticky bottom */}
      <Surface elevation={3} style={styles.submitBar}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={submitting}
          disabled={disabled}
          icon={({ size, color }) => <Save size={size} color={color} strokeWidth={2} />}
          style={styles.submitBtn}
          contentStyle={styles.submitContent}
        >
          {header.editing ? 'Perbarui Nilai' : 'Simpan Nilai'}
        </Button>
      </Surface>

      <Snackbar
        visible={snack.visible}
        onDismiss={() => setSnack((s) => ({ ...s, visible: false }))}
        duration={2500}
        style={{ backgroundColor: snack.variant === 'success' ? palette.success : palette.error }}
      >
        {snack.message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  hero: {
    backgroundColor: palette.primary,
    padding: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  editChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.tertiaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  editChipText: { color: palette.tertiary, fontWeight: '700' },
  heroName: { color: '#fff', fontWeight: '700' },
  heroNim: { color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  heroJudul: { color: 'rgba(255,255,255,0.92)', marginTop: 10, lineHeight: 18, fontStyle: 'italic' },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  roleBadgeText: { color: '#fff', fontWeight: '700' },

  warnBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    margin: 16,
    marginTop: 12,
    marginBottom: 0,
    padding: 12,
    backgroundColor: palette.warningContainer,
    borderRadius: 10,
  },
  warnText: { color: '#92400e', flex: 1, lineHeight: 19 },

  kriteriaCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#fff',
  },
  kriteriaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.outlineVariant,
  },
  kriteriaTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  kriteriaTitle: { color: palette.onSurface, fontWeight: '700', flex: 1 },
  bobotChip: {
    backgroundColor: palette.primaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  bobotText: { color: palette.primary, fontWeight: '800' },

  fieldRow: { marginBottom: 6 },
  input: { backgroundColor: '#fff' },

  totalCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  totalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  totalTitle: { color: palette.onSurface, fontWeight: '700' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  totalLabel: { color: palette.onSurfaceVariant },
  totalValue: { color: palette.onSurface, fontWeight: '700' },
  totalDivider: {
    height: 1,
    backgroundColor: palette.outlineVariant,
    marginTop: 10,
    marginBottom: 14,
  },
  totalRowFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalFinalLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  totalLabelFinal: { color: palette.primary, fontWeight: '800' },
  totalValueFinal: { color: palette.primary, fontWeight: '800' },
  totalNote: {
    color: palette.onSurfaceVariant,
    marginTop: 12,
    fontStyle: 'italic',
    lineHeight: 16,
  },

  submitBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: palette.outlineVariant,
  },
  submitBtn: { borderRadius: 12 },
  submitContent: { paddingVertical: 6 },
});
