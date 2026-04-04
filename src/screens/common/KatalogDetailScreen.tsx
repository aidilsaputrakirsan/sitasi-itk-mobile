import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { katalogApi } from '../../api/endpoints/katalog';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import type { Katalog } from '../../types';
import type { RouteProp } from '@react-navigation/native';

interface Props {
  route: RouteProp<{ KatalogDetail: { id: number } }, 'KatalogDetail'>;
}

export function KatalogDetailScreen({ route }: Props) {
  const { id } = route.params;
  const [data, setData] = useState<Katalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await katalogApi.getById(id);
        if (response.data.success) setData(response.data.data);
      } catch (err: unknown) {
        setError((err as { message?: string }).message ?? 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (error || !data) return <ErrorMessage message={error ?? 'Data tidak ditemukan'} />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{data.judul}</Text>
        {data.mahasiswa && (
          <Text style={styles.author}>{data.mahasiswa.nama} ({data.mahasiswa.nim})</Text>
        )}
        {data.pembimbing_1 && <Text style={styles.info}>Pembimbing 1: {data.pembimbing_1.nama}</Text>}
        {data.pembimbing_2 && <Text style={styles.info}>Pembimbing 2: {data.pembimbing_2.nama}</Text>}
        {data.tahun && <Text style={styles.info}>Tahun: {data.tahun}</Text>}
        {data.kata_kunci && <Text style={styles.keywords}>Kata Kunci: {data.kata_kunci}</Text>}
      </View>
      {data.abstrak && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Abstrak</Text>
          <Text style={styles.abstrak}>{data.abstrak}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  card: { backgroundColor: '#fff', margin: 16, marginBottom: 0, padding: 20, borderRadius: 12 },
  title: { fontSize: 18, fontWeight: '700', color: '#333', lineHeight: 26 },
  author: { fontSize: 14, color: '#0066CC', marginTop: 8 },
  info: { fontSize: 13, color: '#666', marginTop: 4 },
  keywords: { fontSize: 13, color: '#0066CC', marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 8 },
  abstrak: { fontSize: 14, color: '#444', lineHeight: 22 },
});
