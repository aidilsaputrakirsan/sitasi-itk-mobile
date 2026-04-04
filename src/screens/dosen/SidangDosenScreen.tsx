import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { sidangApi } from '../../api/endpoints/sidang';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Sidang, PaginationMeta } from '../../types';

export function SidangDosenScreen() {
  const [items, setItems] = useState<Sidang[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchData = useCallback(async (page = 1, append = false) => {
    try {
      const response = await sidangApi.list({ page, per_page: 15 });
      if (response.data.success) {
        setItems(append ? (prev) => [...prev, ...response.data.data] : response.data.data);
        setMeta(response.data.meta);
      }
    } catch { /* silent */ } finally {
      setLoading(false); setRefreshing(false); setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = () => { setRefreshing(true); fetchData(1); };
  const onEndReached = () => {
    if (!meta || meta.current_page >= meta.last_page || loadingMore) return;
    setLoadingMore(true); fetchData(meta.current_page + 1, true);
  };

  const handleRevisi = (id: number, role: string, status: boolean) => {
    const label = status ? 'selesai' : 'belum selesai';
    Alert.alert('Revisi', `Tandai revisi ${role.replace(/_/g, ' ')} sebagai ${label}?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Ya', onPress: async () => {
          try {
            await sidangApi.submitRevisi(id, { role, status });
            fetchData(1);
          } catch (err: unknown) {
            Alert.alert('Gagal', (err as { message?: string }).message ?? 'Gagal update revisi');
          }
        },
      },
    ]);
  };

  if (loading && !refreshing) return <LoadingScreen />;

  return (
    <FlatList
      style={styles.container}
      data={items}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <StatusBadge status={item.status} />
          </View>
          {item.mahasiswa && (
            <Text style={styles.cardMhs}>{item.mahasiswa.nama} ({item.mahasiswa.nim})</Text>
          )}
          {item.jadwal && (
            <Text style={styles.cardDate}>
              {new Date(item.jadwal.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              {' '}{item.jadwal.waktu_mulai}
            </Text>
          )}
          {item.revisi_status && (
            <View style={styles.revisiContainer}>
              {Object.entries(item.revisi_status).map(([role, done]) => (
                <TouchableOpacity
                  key={role}
                  style={[styles.revisiChip, done ? styles.revisiDone : styles.revisiPending]}
                  onPress={() => handleRevisi(item.id, role, !done)}
                >
                  <Text style={[styles.revisiText, done ? styles.revisiDoneText : styles.revisiPendingText]}>
                    {role.replace(/_/g, ' ')}: {done ? 'Selesai' : 'Belum'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
      ListEmptyComponent={<EmptyState message="Belum ada data sidang" />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      contentContainerStyle={items.length === 0 ? { flex: 1 } : { padding: 16 }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  card: { backgroundColor: '#fff', marginBottom: 10, padding: 16, borderRadius: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 6 },
  cardMhs: { fontSize: 14, fontWeight: '600', color: '#333' },
  cardDate: { fontSize: 13, color: '#0066CC', marginTop: 4 },
  revisiContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  revisiChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  revisiDone: { backgroundColor: '#E8F5E9' },
  revisiPending: { backgroundColor: '#FFF3E0' },
  revisiText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  revisiDoneText: { color: '#2E7D32' },
  revisiPendingText: { color: '#E65100' },
});
