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
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import type { PaginationMeta } from '../../types';

// Field nyata dari PeriodeResource (dan raw model saat successWithPagination)
interface RawPeriode {
  id: number;
  semester?: string;
  periode?: string;        // nama periode, misal "2024/2025"
  gelombang?: string;      // misal "1", "2"
  type?: string;           // "TA" atau "Sempro"
  status?: string;         // "Active" atau "Nonactive"
  is_tampilkan?: boolean;
  jadwal_sempros_count?: number;
  jadwal_tas_count?: number;
}

function StatusChip({ status }: { status?: string }) {
  const isActive = status === 'Active';
  return (
    <View style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}>
      <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}>
        {isActive ? 'Aktif' : 'Nonaktif'}
      </Text>
    </View>
  );
}

function TypeChip({ type }: { type?: string }) {
  return (
    <View style={styles.typeChip}>
      <Text style={styles.typeChipText}>{type ?? '-'}</Text>
    </View>
  );
}

export function PeriodeScreen() {
  const [items, setItems] = useState<RawPeriode[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchData = useCallback(async (page = 1, append = false) => {
    try {
      const response = await periodeApi.list({ page, per_page: 20 });
      if (response.data.success) {
        const raw = response.data.data as unknown as RawPeriode[];
        setItems(append ? (prev) => [...prev, ...raw] : raw);
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

  const handleDelete = (id: number, label: string) => {
    Alert.alert('Hapus', `Hapus periode "${label}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive', onPress: async () => {
          try {
            await periodeApi.delete(id);
            setItems((prev) => prev.filter((p) => p.id !== id));
          } catch (err: unknown) {
            const msg = (err as { message?: string }).message ?? 'Gagal menghapus periode';
            Alert.alert('Gagal', msg);
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
      renderItem={({ item }) => {
        const label = [item.periode, item.semester].filter(Boolean).join(' · ') || `Periode #${item.id}`;
        const jadwalCount = (item.jadwal_sempros_count ?? 0) + (item.jadwal_tas_count ?? 0);

        return (
          <TouchableOpacity
            style={styles.card}
            onLongPress={() => handleDelete(item.id, label)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardName} numberOfLines={2}>{label}</Text>
              <View style={styles.badges}>
                <TypeChip type={item.type} />
                <StatusChip status={item.status} />
              </View>
            </View>

            {item.gelombang !== undefined && item.gelombang !== null && (
              <Text style={styles.cardSub}>Gelombang: {item.gelombang}</Text>
            )}

            <View style={styles.cardFooter}>
              <Text style={styles.cardVisibility}>
                {item.is_tampilkan ? '👁 Ditampilkan' : '🙈 Disembunyikan'}
              </Text>
              {jadwalCount > 0 && (
                <Text style={styles.cardCount}>{jadwalCount} jadwal</Text>
              )}
            </View>
          </TouchableOpacity>
        );
      }}
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
  card: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  cardName: { fontSize: 15, fontWeight: '600', color: '#333', flex: 1 },
  badges: { flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  chipActive: { backgroundColor: '#E8F5E9' },
  chipInactive: { backgroundColor: '#ECEFF1' },
  chipText: { fontSize: 11, fontWeight: '700' },
  chipTextActive: { color: '#2E7D32' },
  chipTextInactive: { color: '#546E7A' },
  typeChip: { backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  typeChipText: { fontSize: 11, color: '#1565C0', fontWeight: '700' },
  cardSub: { fontSize: 13, color: '#666', marginTop: 6 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  cardVisibility: { fontSize: 12, color: '#888' },
  cardCount: { fontSize: 12, color: '#0066CC', fontWeight: '600' },
});
