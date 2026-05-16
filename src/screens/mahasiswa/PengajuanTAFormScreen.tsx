import React, { useState, useEffect } from 'react';
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
import { FileText, Send, Tag } from 'lucide-react-native';
import { pengajuanTAApi } from '../../api/endpoints/pengajuanTA';
import { DosenPicker } from '../../components/ui/DosenPicker';
import { palette } from '../../theme';
import type { AvailableDosen } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PengajuanTAForm'>;

type SnackState = { visible: boolean; message: string; variant: 'success' | 'error' };

export function PengajuanTAFormScreen({ route, navigation }: Props) {
  const editData = route.params?.data;
  const isEdit = !!editData;

  const [judul, setJudul] = useState(editData?.judul ?? '');
  const [bidangPenelitian, setBidangPenelitian] = useState(editData?.bidang_penelitian ?? '');
  const [pembimbing1, setPembimbing1] = useState<number | null>(editData?.pembimbing_1?.id ?? null);
  const [pembimbing2, setPembimbing2] = useState<number | null>(editData?.pembimbing_2?.id ?? null);
  const [dosenList, setDosenList] = useState<AvailableDosen[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [snack, setSnack] = useState<SnackState>({
    visible: false,
    message: '',
    variant: 'success',
  });

  const showSnack = (message: string, variant: 'success' | 'error') =>
    setSnack({ visible: true, message, variant });

  useEffect(() => {
    (async () => {
      try {
        const response = await pengajuanTAApi.getAvailableDosen();
        if (response.data.success) setDosenList(response.data.data);
      } catch {
        /* silent */
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!judul.trim() || !bidangPenelitian.trim() || !pembimbing1) {
      showSnack('Judul, bidang penelitian, dan pembimbing 1 harus diisi', 'error');
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      const payload = {
        judul,
        bidang_penelitian: bidangPenelitian,
        pembimbing_1: pembimbing1,
        pembimbing_2: pembimbing2 ?? undefined,
      };

      if (isEdit && editData) {
        await pengajuanTAApi.update(editData.id, payload);
      } else {
        await pengajuanTAApi.create(payload);
      }

      showSnack(isEdit ? 'Pengajuan berhasil diperbarui' : 'Pengajuan berhasil diajukan', 'success');
      setTimeout(() => navigation.goBack(), 900);
    } catch (err: unknown) {
      const error = err as { message?: string; errors?: Record<string, string[]> };
      if (error.errors) {
        setErrors(error.errors);
        showSnack('Periksa kembali isian form', 'error');
      } else {
        showSnack(error.message ?? 'Terjadi kesalahan', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Surface elevation={0} style={styles.header}>
          <Text variant="titleMedium" style={styles.headerTitle}>
            {isEdit ? 'Edit Pengajuan TA' : 'Ajukan Tugas Akhir'}
          </Text>
          <Text variant="bodySmall" style={styles.headerSubtitle}>
            Isi judul, bidang penelitian, dan pilih dosen pembimbing Anda
          </Text>
        </Surface>

        {/* Judul */}
        <Card mode="elevated" style={styles.section}>
          <Card.Content>
            <SectionLabel Icon={FileText} text="Judul Tugas Akhir" />
            <TextInput
              mode="outlined"
              value={judul}
              onChangeText={setJudul}
              placeholder="Tuliskan judul lengkap tugas akhir..."
              multiline
              numberOfLines={3}
              error={!!errors.judul}
              style={[styles.input, styles.textArea]}
            />
            <HelperText type="error" visible={!!errors.judul}>
              {errors.judul?.[0] ?? ' '}
            </HelperText>
          </Card.Content>
        </Card>

        {/* Bidang */}
        <Card mode="elevated" style={styles.section}>
          <Card.Content>
            <SectionLabel Icon={Tag} text="Bidang Penelitian" />
            <TextInput
              mode="outlined"
              value={bidangPenelitian}
              onChangeText={setBidangPenelitian}
              placeholder="Contoh: Machine Learning, IoT, Web Development"
              error={!!errors.bidang_penelitian}
              style={styles.input}
            />
            <HelperText type="error" visible={!!errors.bidang_penelitian}>
              {errors.bidang_penelitian?.[0] ?? ' '}
            </HelperText>
          </Card.Content>
        </Card>

        {/* Pembimbing 1 — searchable picker (WAJIB) */}
        <View style={styles.pickerWrap}>
          <DosenPicker
            label="Pembimbing 1"
            value={pembimbing1}
            options={dosenList}
            exclude={[pembimbing2]}
            onChange={setPembimbing1}
            required
            error={!!errors.pembimbing_1}
          />
          <HelperText type="error" visible={!!errors.pembimbing_1}>
            {errors.pembimbing_1?.[0] ?? ' '}
          </HelperText>
        </View>

        {/* Pembimbing 2 — searchable picker (opsional) */}
        <View style={styles.pickerWrap}>
          <DosenPicker
            label="Pembimbing 2 (opsional)"
            value={pembimbing2}
            options={dosenList}
            exclude={[pembimbing1]}
            onChange={setPembimbing2}
            allowNone
          />
        </View>
      </ScrollView>

      <Surface elevation={3} style={styles.submitBar}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
          icon={({ size, color }) => <Send size={size} color={color} strokeWidth={2} />}
          contentStyle={styles.submitContent}
          style={styles.submitBtn}
        >
          {isEdit ? 'Perbarui Pengajuan' : 'Ajukan Sekarang'}
        </Button>
      </Surface>

      <Snackbar
        visible={snack.visible}
        onDismiss={() => setSnack((s) => ({ ...s, visible: false }))}
        duration={2500}
        style={{
          backgroundColor: snack.variant === 'success' ? palette.success : palette.error,
        }}
      >
        {snack.message}
      </Snackbar>
    </View>
  );
}

function SectionLabel({
  Icon,
  text,
}: {
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  text: string;
}) {
  return (
    <View style={styles.sectionLabel}>
      <Icon size={16} color={palette.primary} strokeWidth={2} />
      <Text variant="labelLarge" style={styles.sectionLabelText}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  header: { padding: 16, paddingBottom: 4, backgroundColor: 'transparent' },
  headerTitle: { color: palette.onSurface, fontWeight: '700' },
  headerSubtitle: { color: palette.onSurfaceVariant, marginTop: 2 },

  section: { marginHorizontal: 16, marginTop: 10, backgroundColor: '#fff' },
  pickerWrap: { marginHorizontal: 16, marginTop: 10 },

  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionLabelText: { color: palette.onSurface, fontWeight: '700' },

  input: { backgroundColor: '#fff' },
  textArea: { minHeight: 80 },

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
