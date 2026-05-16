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
import { Calendar, FileText, MessageSquare, Save } from 'lucide-react-native';
import { bimbinganApi } from '../../api/endpoints/bimbingan';
import { usersApi } from '../../api/endpoints/users';
import { DosenPicker } from '../../components/ui/DosenPicker';
import { palette } from '../../theme';
import type { AvailableDosen } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'BimbinganForm'>;

type SnackState = { visible: boolean; message: string; variant: 'success' | 'error' };

export function BimbinganFormScreen({ route, navigation }: Props) {
  const editData = route.params?.data;
  const isEdit = !!editData;

  const [tanggal, setTanggal] = useState(
    editData?.tanggal ?? new Date().toISOString().split('T')[0]
  );
  const [dosenId, setDosenId] = useState<number | null>(editData?.dosen?.id ?? null);
  const [ketBimbingan, setKetBimbingan] = useState(editData?.ket_bimbingan ?? '');
  const [hasilBimbingan, setHasilBimbingan] = useState(editData?.hasil_bimbingan ?? '');
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
        const response = await usersApi.listDosen({ per_page: 100 });
        if (response.data.success) setDosenList(response.data.data);
      } catch {
        /* silent */
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!dosenId) {
      showSnack('Pilih dosen pembimbing', 'error');
      return;
    }
    if (!ketBimbingan.trim()) {
      showSnack('Keterangan bimbingan harus diisi', 'error');
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      const payload = {
        tanggal,
        dosen: dosenId,
        ket_bimbingan: ketBimbingan,
        hasil_bimbingan: hasilBimbingan || undefined,
      };

      if (isEdit && editData) {
        await bimbinganApi.update(editData.id, payload);
      } else {
        await bimbinganApi.create(payload);
      }

      showSnack(isEdit ? 'Bimbingan berhasil diperbarui' : 'Bimbingan berhasil dibuat', 'success');
      setTimeout(() => navigation.goBack(), 800);
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
        {/* Header */}
        <Surface elevation={0} style={styles.header}>
          <Text variant="titleMedium" style={styles.headerTitle}>
            {isEdit ? 'Edit Bimbingan' : 'Catat Bimbingan'}
          </Text>
          <Text variant="bodySmall" style={styles.headerSubtitle}>
            {isEdit
              ? 'Perbarui data sesi bimbingan Anda'
              : 'Isi detail sesi bimbingan dengan dosen pembimbing'}
          </Text>
        </Surface>

        {/* Tanggal */}
        <Card mode="elevated" style={styles.section}>
          <Card.Content>
            <View style={styles.sectionLabel}>
              <Calendar size={16} color={palette.primary} strokeWidth={2} />
              <Text variant="labelLarge" style={styles.sectionLabelText}>
                Tanggal Bimbingan
              </Text>
            </View>
            <TextInput
              mode="outlined"
              value={tanggal}
              onChangeText={setTanggal}
              placeholder="YYYY-MM-DD"
              error={!!errors.tanggal}
              style={styles.input}
            />
            <HelperText type="error" visible={!!errors.tanggal}>
              {errors.tanggal?.[0] ?? ' '}
            </HelperText>
          </Card.Content>
        </Card>

        {/* Dosen pembimbing — searchable picker */}
        <View style={styles.pickerWrap}>
          <DosenPicker
            label="Dosen Pembimbing"
            value={dosenId}
            options={dosenList}
            onChange={setDosenId}
            required
            error={!!errors.dosen}
          />
          <HelperText type="error" visible={!!errors.dosen}>
            {errors.dosen?.[0] ?? ' '}
          </HelperText>
        </View>

        {/* Keterangan */}
        <Card mode="elevated" style={styles.section}>
          <Card.Content>
            <View style={styles.sectionLabel}>
              <FileText size={16} color={palette.primary} strokeWidth={2} />
              <Text variant="labelLarge" style={styles.sectionLabelText}>
                Keterangan Bimbingan
              </Text>
            </View>
            <TextInput
              mode="outlined"
              value={ketBimbingan}
              onChangeText={setKetBimbingan}
              placeholder="Topik atau materi yang dibahas..."
              multiline
              numberOfLines={4}
              error={!!errors.ket_bimbingan}
              style={[styles.input, styles.textArea]}
            />
            <HelperText type="error" visible={!!errors.ket_bimbingan}>
              {errors.ket_bimbingan?.[0] ?? ' '}
            </HelperText>
          </Card.Content>
        </Card>

        {/* Hasil */}
        <Card mode="elevated" style={styles.section}>
          <Card.Content>
            <View style={styles.sectionLabel}>
              <MessageSquare size={16} color={palette.primary} strokeWidth={2} />
              <Text variant="labelLarge" style={styles.sectionLabelText}>
                Hasil Bimbingan
              </Text>
              <Text variant="labelSmall" style={styles.optional}>
                opsional
              </Text>
            </View>
            <TextInput
              mode="outlined"
              value={hasilBimbingan}
              onChangeText={setHasilBimbingan}
              placeholder="Catatan / arahan dari dosen..."
              multiline
              numberOfLines={4}
              style={[styles.input, styles.textArea]}
            />
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Submit button — sticky bottom */}
      <Surface elevation={3} style={styles.submitBar}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
          icon={({ size, color }) => <Save size={size} color={color} strokeWidth={2} />}
          contentStyle={styles.submitContent}
          style={styles.submitBtn}
        >
          {isEdit ? 'Perbarui Bimbingan' : 'Simpan Bimbingan'}
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  header: { padding: 16, paddingBottom: 8, backgroundColor: 'transparent' },
  headerTitle: { color: palette.onSurface, fontWeight: '700' },
  headerSubtitle: { color: palette.onSurfaceVariant, marginTop: 2 },

  section: { marginHorizontal: 16, marginTop: 10, backgroundColor: '#fff' },
  pickerWrap: { marginHorizontal: 16, marginTop: 10 },

  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionLabelText: {
    color: palette.onSurface,
    fontWeight: '700',
    flex: 1,
  },
  optional: {
    color: palette.onSurfaceVariant,
    fontStyle: 'italic',
  },

  input: { backgroundColor: '#fff' },
  textArea: { minHeight: 100 },

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
