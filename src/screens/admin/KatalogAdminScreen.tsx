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
import { katalogApi } from '../../api/endpoints/katalog';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Katalog, PaginationMeta } from '../../types';

export function KatalogAdminScreen() {
  const [items, setItems] = useState<Katalog[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchData = useCallback(async (page = 1, append = false) => {
    try {
      const response = await katalogApi.list({ page, per_page: 15 });
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

  const handleApprove = (id: number) => {
    Alert.alert('Approve', 'Setujui katalog ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Approve', onPress: async () => {
          try {
            await katalogApi.approve(id);
            fetchData(1);
          } catch (err: unknown) {
            Alert.alert('Gagal', (err as { message?: string }).message ?? 'Gagal approve');
          }
        },
      },
    ]);
  };

  const handleReject = (id: number) => {
    Alert.alert('Reject', 'Tolak katalog ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Tolak', style: 'destructive', onPress: async () => {
          try {
            await katalogApi.reject(id);
            setItems((prev) => prev.filter((k) => k.id !== id));
          } catch (err: unknown) {
            Alert.alert('Gagal', (err as { message?: string }).message ?? 'Gagal reject');
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
          <Text style={styles.cardTitle} numberOfLines={2}>{item.judul}</Text>
          {item.mahasiswa && (
            <Text style={styles.cardMhs}>{item.mahasiswa.nama} ({item.mahasiswa.nim})</Text>
          )}
          {item.status && (
            <Text style={styles.cardStatus}>Status: {item.status}</Text>
          )}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item.id)}>
              <Text style={styles.approveBtnText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item.id)}>
              <Text style={styles.rejectBtnText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListEmptyComponent={<EmptyState message="Belum ada katalog" />}
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
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  cardMhs: { fontSize: 13, color: '#0066CC', marginTop: 4 },
  cardStatus: { fontSize: 12, color: '#666', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  approveBtn: { flex: 1, backgroundColor: '#2E7D32', padding: 10, borderRadius: 8, alignItems: 'center' },
  approveBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  rejectBtn: { flex: 1, backgroundColor: '#FFEBEE', padding: 10, borderRadius: 8, alignItems: 'center' },
  rejectBtnText: { color: '#C62828', fontSize: 13, fontWeight: '600' },
});
