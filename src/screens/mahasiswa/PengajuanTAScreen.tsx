import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { pengajuanTAApi } from '../../api/endpoints/pengajuanTA';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import type { PengajuanTA, PaginationMeta } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props {
  navigation: NativeStackNavigationProp<Record<string, object | undefined>>;
}

export function PengajuanTAScreen({ navigation }: Props) {
  const [items, setItems] = useState<PengajuanTA[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchData = useCallback(async (page = 1, append = false) => {
    try {
      const response = await pengajuanTAApi.list({ page, per_page: 15 });
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

  if (loading && !refreshing) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('PengajuanTADetail', { id: item.id })}
          >
            <View style={styles.cardHeader}>
              <StatusBadge status={item.status} />
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.judul}</Text>
            <Text style={styles.cardField}>{item.bidang_penelitian}</Text>
            {item.pembimbing_1 && <Text style={styles.cardDosen}>Pembimbing 1: {item.pembimbing_1.nama}</Text>}
            {item.pembimbing_2 && <Text style={styles.cardDosen}>Pembimbing 2: {item.pembimbing_2.nama}</Text>}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState message="Belum ada pengajuan TA" />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        contentContainerStyle={items.length === 0 ? { flex: 1 } : { padding: 16 }}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('PengajuanTAForm')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  card: { backgroundColor: '#fff', marginBottom: 10, padding: 16, borderRadius: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  cardField: { fontSize: 13, color: '#0066CC', marginTop: 4 },
  cardDosen: { fontSize: 13, color: '#666', marginTop: 2 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0066CC', justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
});
