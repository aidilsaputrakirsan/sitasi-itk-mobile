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
import { periodeApi } from '../../api/endpoints/periode';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Periode, PaginationMeta } from '../../types';

export function PeriodeScreen() {
  const [items, setItems] = useState<Periode[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchData = useCallback(async (page = 1, append = false) => {
    try {
      const response = await periodeApi.list({ page, per_page: 20 });
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

  const handleDelete = (id: number, nama: string) => {
    Alert.alert('Hapus', `Hapus periode "${nama}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive', onPress: async () => {
          try {
            await periodeApi.delete(id);
            setItems((prev) => prev.filter((p) => p.id !== id));
          } catch (err: unknown) {
            Alert.alert('Gagal', (err as { message?: string }).message ?? 'Gagal menghapus');
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
        <TouchableOpacity
          style={styles.card}
          onLongPress={() => handleDelete(item.id, item.nama)}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardName}>{item.nama}</Text>
            <StatusBadge status={item.status} />
          </View>
          <Text style={styles.cardType}>Tipe: {item.type.toUpperCase()}</Text>
          <Text style={styles.cardDate}>
            {new Date(item.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            {' - '}
            {new Date(item.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Text>
          <Text style={styles.cardVisibility}>
            {item.is_tampilkan ? 'Ditampilkan' : 'Disembunyikan'}
          </Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<EmptyState message="Belum ada periode" />}
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 15, fontWeight: '600', color: '#333', flex: 1, marginRight: 8 },
  cardType: { fontSize: 13, color: '#0066CC', marginTop: 6 },
  cardDate: { fontSize: 13, color: '#666', marginTop: 4 },
  cardVisibility: { fontSize: 12, color: '#999', marginTop: 4 },
});
