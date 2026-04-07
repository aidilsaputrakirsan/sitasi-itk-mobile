import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { bimbinganApi } from '../../api/endpoints/bimbingan';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Bimbingan, BimbinganStatus, PaginationMeta } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props {
  navigation: NativeStackNavigationProp<Record<string, object | undefined>>;
}

export function BimbinganScreen({ navigation }: Props) {
  const [items, setItems] = useState<Bimbingan[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<BimbinganStatus | undefined>(undefined);

  const fetchData = useCallback(async (page = 1, append = false) => {
    try {
      const response = await bimbinganApi.list({ page, per_page: 15, status: filter });
      if (response.data.success) {
        setItems(append ? (prev) => [...prev, ...response.data.data] : response.data.data);
        setMeta(response.data.meta);
      }
    } catch { /* silent */ } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [filter]);

  useEffect(() => { setLoading(true); fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(1); };
  const onEndReached = () => {
    if (!meta || meta.current_page >= meta.last_page || loadingMore) return;
    setLoadingMore(true);
    fetchData(meta.current_page + 1, true);
  };

  if (loading && !refreshing) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {([undefined, 'created', 'approved', 'rejected'] as (BimbinganStatus | undefined)[]).map((f) => (
          <TouchableOpacity
            key={f ?? 'all'}
            style={[styles.filterChip, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f ? f.charAt(0).toUpperCase() + f.slice(1) : 'Semua'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('BimbinganDetail', { id: item.id })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardDate}>
                {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
              <StatusBadge status={item.status} />
            </View>
            {item.dosen && <Text style={styles.cardDosen}>Dosen: {item.dosen.name}</Text>}
            <Text style={styles.cardKet} numberOfLines={2}>{item.ket_bimbingan}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState message="Belum ada data bimbingan" />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        contentContainerStyle={items.length === 0 ? { flex: 1 } : { paddingBottom: 16 }}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('BimbinganForm')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  filterRow: { flexDirection: 'row', padding: 12, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0' },
  filterActive: { backgroundColor: '#0066CC', borderColor: '#0066CC' },
  filterText: { fontSize: 12, color: '#666' },
  filterTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, padding: 16, borderRadius: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDate: { fontSize: 14, fontWeight: '600', color: '#333' },
  cardDosen: { fontSize: 13, color: '#0066CC', marginTop: 6 },
  cardKet: { fontSize: 13, color: '#666', marginTop: 4 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0066CC', justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
});
