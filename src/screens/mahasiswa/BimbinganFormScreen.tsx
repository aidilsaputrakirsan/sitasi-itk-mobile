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
import { bimbinganApi } from '../../api/endpoints/bimbingan';
import { usersApi } from '../../api/endpoints/users';
import type { Bimbingan, AvailableDosen } from '../../types';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props {
  route: RouteProp<{ BimbinganForm: { id?: number; data?: Bimbingan } }, 'BimbinganForm'>;
  navigation: NativeStackNavigationProp<Record<string, object | undefined>>;
}

export function BimbinganFormScreen({ route, navigation }: Props) {
  const editData = route.params?.data;
  const isEdit = !!editData;

  const [tanggal, setTanggal] = useState(editData?.tanggal ?? new Date().toISOString().split('T')[0]);
  const [dosenId, setDosenId] = useState<number | null>(editData?.dosen?.id ?? null);
  const [ketBimbingan, setKetBimbingan] = useState(editData?.ket_bimbingan ?? '');
  const [hasilBimbingan, setHasilBimbingan] = useState(editData?.hasil_bimbingan ?? '');
  const [dosenList, setDosenList] = useState<AvailableDosen[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    (async () => {
      try {
        const response = await usersApi.listDosen({ per_page: 100 });
        if (response.data.success) setDosenList(response.data.data);
      } catch { /* silent */ }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!dosenId) { Alert.alert('Error', 'Pilih dosen pembimbing'); return; }
    if (!ketBimbingan.trim()) { Alert.alert('Error', 'Keterangan bimbingan harus diisi'); return; }

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

      Alert.alert('Berhasil', isEdit ? 'Bimbingan berhasil diperbarui' : 'Bimbingan berhasil dibuat');
      navigation.goBack();
    } catch (err: unknown) {
      const error = err as { message?: string; errors?: Record<string, string[]> };
      if (error.errors) setErrors(error.errors);
      else Alert.alert('Gagal', error.message ?? 'Terjadi kesalahan');
    } finally { setSubmitting(false); }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Text style={styles.label}>Tanggal</Text>
        <TextInput
          style={styles.input}
          value={tanggal}
          onChangeText={setTanggal}
          placeholder="YYYY-MM-DD"
        />
        {errors.tanggal?.map((msg, i) => <Text key={i} style={styles.fieldError}>{msg}</Text>)}

        <Text style={styles.label}>Dosen Pembimbing</Text>
        <ScrollView horizontal style={styles.dosenPicker} showsHorizontalScrollIndicator={false}>
          {dosenList.map((d) => (
            <TouchableOpacity
              key={d.id}
              style={[styles.dosenChip, dosenId === d.id && styles.dosenChipActive]}
              onPress={() => setDosenId(d.id)}
            >
              <Text style={[styles.dosenChipText, dosenId === d.id && styles.dosenChipTextActive]}>
                {d.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {errors.dosen?.map((msg, i) => <Text key={i} style={styles.fieldError}>{msg}</Text>)}

        <Text style={styles.label}>Keterangan Bimbingan</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={ketBimbingan}
          onChangeText={setKetBimbingan}
          placeholder="Tuliskan keterangan bimbingan..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        {errors.ket_bimbingan?.map((msg, i) => <Text key={i} style={styles.fieldError}>{msg}</Text>)}

        <Text style={styles.label}>Hasil Bimbingan (opsional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={hasilBimbingan}
          onChangeText={setHasilBimbingan}
          placeholder="Tuliskan hasil bimbingan..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.submitButton, submitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{isEdit ? 'Update' : 'Simpan'}</Text>
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
  textArea: { minHeight: 100 },
  dosenPicker: { flexDirection: 'row', marginVertical: 4 },
  dosenChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: '#F5F7FA', marginRight: 8, borderWidth: 1, borderColor: '#E0E0E0' },
  dosenChipActive: { backgroundColor: '#0066CC', borderColor: '#0066CC' },
  dosenChipText: { fontSize: 13, color: '#666' },
  dosenChipTextActive: { color: '#fff' },
  fieldError: { color: '#CC0000', fontSize: 12, marginTop: 4 },
  submitButton: { backgroundColor: '#0066CC', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 24 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
