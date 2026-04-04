import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  RefreshControl,
} from 'react-native';
import { jadwalApi } from '../../api/endpoints/jadwal';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import type { JadwalSempro, JadwalSidang } from '../../types';

interface Section {
  title: string;
  data: (JadwalSempro | JadwalSidang)[];
}

export function JadwalAdminScreen() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [semproRes, sidangRes] = await Promise.all([
        jadwalApi.listSempro({ per_page: 50 }),
        jadwalApi.listSidang({ per_page: 50 }),
      ]);

      const result: Section[] = [];
      if (semproRes.data.success && semproRes.data.data.length > 0) {
        result.push({ title: 'Jadwal Sempro', data: semproRes.data.data });
      }
      if (sidangRes.data.success && sidangRes.data.data.length > 0) {
        result.push({ title: 'Jadwal Sidang', data: sidangRes.data.data });
      }
      setSections(result);
    } catch { /* silent */ } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  if (loading) return <LoadingScreen />;

  return (
    <SectionList
      style={styles.container}
      sections={sections}
      keyExtractor={(item) => String(item.id)}
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionHeader}>{section.title}</Text>
      )}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.cardDate}>
            {new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </Text>
          <Text style={styles.cardTime}>{item.waktu_mulai} - {item.waktu_selesai}</Text>
          {item.ruangan && <Text style={styles.cardRoom}>Ruangan: {item.ruangan}</Text>}
          {item.mahasiswa && <Text style={styles.cardMhs}>{item.mahasiswa.nama} ({item.mahasiswa.nim})</Text>}
        </View>
      )}
      ListEmptyComponent={<EmptyState message="Belum ada jadwal" />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={sections.length === 0 ? { flex: 1 } : { paddingBottom: 16 }}
      stickySectionHeadersEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: '#333', marginHorizontal: 16, marginTop: 16, marginBottom: 8 },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, padding: 14, borderRadius: 12 },
  cardDate: { fontSize: 14, fontWeight: '600', color: '#333' },
  cardTime: { fontSize: 13, color: '#0066CC', marginTop: 2 },
  cardRoom: { fontSize: 13, color: '#666', marginTop: 2 },
  cardMhs: { fontSize: 13, color: '#666', marginTop: 4 },
});
