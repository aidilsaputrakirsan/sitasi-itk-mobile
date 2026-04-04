import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { pengajuanTAApi } from '../../api/endpoints/pengajuanTA';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import type { PengajuanTA } from '../../types';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props {
  route: RouteProp<{ PengajuanTADetail: { id: number } }, 'PengajuanTADetail'>;
  navigation: NativeStackNavigationProp<Record<string, object | undefined>>;
}

export function PengajuanTADetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const [data, setData] = useState<PengajuanTA | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await pengajuanTAApi.getById(id);
        if (response.data.success) setData(response.data.data);
      } catch (err: unknown) {
        setError((err as { message?: string }).message ?? 'Gagal memuat data');
      } finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (error || !data) return <ErrorMessage message={error ?? 'Data tidak ditemukan'} />;

  const canEdit = data.status === 'pending' || data.status === 'revision';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <StatusBadge status={data.status} />
        </View>
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Judul</Text>
        <Text style={styles.content}>{data.judul}</Text>
        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Bidang Penelitian</Text>
        <Text style={styles.content}>{data.bidang_penelitian}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Pembimbing</Text>
        {data.pembimbing_1 && <Text style={styles.dosenName}>1. {data.pembimbing_1.nama}</Text>}
        {data.pembimbing_2 && <Text style={styles.dosenName}>2. {data.pembimbing_2.nama}</Text>}
      </View>
      {data.keterangan && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Keterangan</Text>
          <Text style={styles.content}>{data.keterangan}</Text>
        </View>
      )}
      {canEdit && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('PengajuanTAForm', { id: data.id, data })}
        >
          <Text style={styles.editButtonText}>Edit Pengajuan</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  card: { backgroundColor: '#fff', margin: 16, marginBottom: 0, padding: 20, borderRadius: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 },
  content: { fontSize: 15, color: '#333', marginTop: 4, lineHeight: 22 },
  dosenName: { fontSize: 14, color: '#333', marginTop: 6 },
  label: { fontSize: 14, color: '#666' },
  editButton: { backgroundColor: '#0066CC', margin: 16, padding: 14, borderRadius: 10, alignItems: 'center' },
  editButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
