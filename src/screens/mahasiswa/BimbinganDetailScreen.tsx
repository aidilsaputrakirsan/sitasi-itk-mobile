import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { bimbinganApi } from '../../api/endpoints/bimbingan';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import type { Bimbingan } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'BimbinganDetail'>;

export function BimbinganDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const [data, setData] = useState<Bimbingan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await bimbinganApi.getById(id);
        if (response.data.success) setData(response.data.data);
      } catch (err: unknown) {
        setError((err as { message?: string }).message ?? 'Gagal memuat data');
      } finally { setLoading(false); }
    })();
  }, [id]);

  const handleDelete = () => {
    Alert.alert('Hapus', 'Hapus bimbingan ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive', onPress: async () => {
          try {
            await bimbinganApi.delete(id);
            navigation.goBack();
          } catch (err: unknown) {
            Alert.alert('Gagal', (err as { message?: string }).message ?? 'Gagal menghapus');
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingScreen />;
  if (error || !data) return <ErrorMessage message={error ?? 'Data tidak ditemukan'} />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <StatusBadge status={data.status} />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tanggal</Text>
          <Text style={styles.value}>{new Date(data.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
        </View>
        {data.dosen && (
          <View style={styles.row}>
            <Text style={styles.label}>Dosen</Text>
            <Text style={styles.value}>{data.dosen.name}</Text>
          </View>
        )}
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Keterangan Bimbingan</Text>
        <Text style={styles.content}>{data.ket_bimbingan}</Text>
      </View>
      {data.hasil_bimbingan && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Hasil Bimbingan</Text>
          <Text style={styles.content}>{data.hasil_bimbingan}</Text>
        </View>
      )}
      {data.status === 'created' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('BimbinganForm', { id: data.id, data })}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Hapus</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  card: { backgroundColor: '#fff', margin: 16, marginBottom: 0, padding: 20, borderRadius: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 14, fontWeight: '600', color: '#333' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 8 },
  content: { fontSize: 14, color: '#444', lineHeight: 22 },
  actions: { flexDirection: 'row', margin: 16, gap: 12 },
  editButton: { flex: 1, backgroundColor: '#0066CC', padding: 14, borderRadius: 10, alignItems: 'center' },
  editButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  deleteButton: { flex: 1, backgroundColor: '#fff', padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#FFCDD2' },
  deleteButtonText: { color: '#CC0000', fontSize: 15, fontWeight: '600' },
});
