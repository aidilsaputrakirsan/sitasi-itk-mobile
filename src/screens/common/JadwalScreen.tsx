import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { jadwalApi } from '../../api/endpoints/jadwal';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import type { MySchedule } from '../../types';

export function JadwalScreen() {
  const [data, setData] = useState<MySchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await jadwalApi.mySchedule();
      if (response.data.success) setData(response.data.data);
    } catch { /* silent */ } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  if (loading) return <LoadingScreen />;

  const hasSchedule = (data?.sempro?.length ?? 0) + (data?.sidang?.length ?? 0) > 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {!hasSchedule && <EmptyState message="Belum ada jadwal" />}

      {(data?.sempro?.length ?? 0) > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Jadwal Sempro</Text>
          {data!.sempro.map((j) => (
            <View key={j.id} style={styles.card}>
              <Text style={styles.cardDate}>{new Date(j.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
              <Text style={styles.cardTime}>{j.waktu_mulai} - {j.waktu_selesai}</Text>
              {j.ruangan && <Text style={styles.cardRoom}>Ruangan: {j.ruangan}</Text>}
              {j.mahasiswa && <Text style={styles.cardInfo}>{j.mahasiswa.nama} ({j.mahasiswa.nim})</Text>}
            </View>
          ))}
        </View>
      )}

      {(data?.sidang?.length ?? 0) > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Jadwal Sidang</Text>
          {data!.sidang.map((j) => (
            <View key={j.id} style={styles.card}>
              <Text style={styles.cardDate}>{new Date(j.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
              <Text style={styles.cardTime}>{j.waktu_mulai} - {j.waktu_selesai}</Text>
              {j.ruangan && <Text style={styles.cardRoom}>Ruangan: {j.ruangan}</Text>}
              {j.mahasiswa && <Text style={styles.cardInfo}>{j.mahasiswa.nama} ({j.mahasiswa.nim})</Text>}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  section: { margin: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10 },
  cardDate: { fontSize: 14, fontWeight: '600', color: '#333' },
  cardTime: { fontSize: 13, color: '#0066CC', marginTop: 4 },
  cardRoom: { fontSize: 13, color: '#666', marginTop: 4 },
  cardInfo: { fontSize: 13, color: '#666', marginTop: 4 },
});
