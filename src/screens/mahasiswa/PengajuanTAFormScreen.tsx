import React, { useState, useEffect } from 'react';
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
import { pengajuanTAApi } from '../../api/endpoints/pengajuanTA';
import type { AvailableDosen } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PengajuanTAForm'>;

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

  useEffect(() => {
    (async () => {
      try {
        const response = await pengajuanTAApi.getAvailableDosen();
        if (response.data.success) setDosenList(response.data.data);
      } catch { /* silent */ }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!judul.trim() || !bidangPenelitian.trim() || !pembimbing1) {
      Alert.alert('Error', 'Judul, bidang penelitian, dan pembimbing 1 harus diisi');
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

      Alert.alert('Berhasil', isEdit ? 'Pengajuan berhasil diperbarui' : 'Pengajuan berhasil dibuat');
      navigation.goBack();
    } catch (err: unknown) {
      const error = err as { message?: string; errors?: Record<string, string[]> };
      if (error.errors) setErrors(error.errors);
      else Alert.alert('Gagal', error.message ?? 'Terjadi kesalahan');
    } finally { setSubmitting(false); }
  };

  const renderDosenPicker = (
    label: string,
    selected: number | null,
    onSelect: (id: number | null) => void,
    exclude?: number | null
  ) => (
    <>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal style={styles.dosenPicker} showsHorizontalScrollIndicator={false}>
        {label.includes('2') && (
          <TouchableOpacity
            style={[styles.dosenChip, selected === null && styles.dosenChipActive]}
            onPress={() => onSelect(null)}
          >
            <Text style={[styles.dosenChipText, selected === null && styles.dosenChipTextActive]}>Tidak ada</Text>
          </TouchableOpacity>
        )}
        {dosenList
          .filter((d) => d.id !== exclude)
          .map((d) => (
            <TouchableOpacity
              key={d.id}
              style={[styles.dosenChip, selected === d.id && styles.dosenChipActive]}
              onPress={() => onSelect(d.id)}
            >
              <Text style={[styles.dosenChipText, selected === d.id && styles.dosenChipTextActive]}>
                {d.name}
              </Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </>
  );

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Text style={styles.label}>Judul Tugas Akhir</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={judul}
          onChangeText={setJudul}
          placeholder="Masukkan judul tugas akhir..."
          multiline
          textAlignVertical="top"
        />
        {errors.judul?.map((msg, i) => <Text key={i} style={styles.fieldError}>{msg}</Text>)}

        <Text style={styles.label}>Bidang Penelitian</Text>
        <TextInput
          style={styles.input}
          value={bidangPenelitian}
          onChangeText={setBidangPenelitian}
          placeholder="Contoh: Machine Learning, IoT, Web Development"
        />
        {errors.bidang_penelitian?.map((msg, i) => <Text key={i} style={styles.fieldError}>{msg}</Text>)}

        {renderDosenPicker('Pembimbing 1 *', pembimbing1, setPembimbing1, pembimbing2)}
        {errors.pembimbing_1?.map((msg, i) => <Text key={i} style={styles.fieldError}>{msg}</Text>)}

        {renderDosenPicker('Pembimbing 2 (opsional)', pembimbing2, setPembimbing2, pembimbing1)}

        <TouchableOpacity
          style={[styles.submitButton, submitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : (
            <Text style={styles.submitButtonText}>{isEdit ? 'Update' : 'Ajukan'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  form: { margin: 16, backgroundColor: '#fff', padding: 20, borderRadius: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: '#F5F7FA', borderRadius: 10, padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#E0E0E0' },
  textArea: { minHeight: 80 },
  dosenPicker: { flexDirection: 'row', marginVertical: 4 },
  dosenChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: '#F5F7FA', marginRight: 8, borderWidth: 1, borderColor: '#E0E0E0' },
  dosenChipActive: { backgroundColor: '#0066CC', borderColor: '#0066CC' },
  dosenChipText: { fontSize: 13, color: '#666' },
  dosenChipTextActive: { color: '#fff' },
  fieldError: { color: '#CC0000', fontSize: 12, marginTop: 4 },
  submitButton: { backgroundColor: '#0066CC', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 24 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
