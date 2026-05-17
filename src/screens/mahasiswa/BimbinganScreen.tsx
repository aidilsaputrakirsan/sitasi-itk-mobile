import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  ActivityIndicator,
  Card,
  Chip,
  FAB,
  Surface,
  Text,
  TouchableRipple,
} from 'react-native-paper';
import { Calendar, ChevronRight, GraduationCap, Plus } from 'lucide-react-native';
import { bimbinganApi } from '../../api/endpoints/bimbingan';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import { TabHeader } from '../../components/ui/TabHeader';
import { palette } from '../../theme';
import type { Bimbingan, BimbinganStatus, PaginationMeta } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

interface FilterOption {
  value: BimbinganStatus | undefined;
  label: string;
}

const filters: FilterOption[] = [
  { value: undefined, label: 'Semua' },
  { value: 'created', label: 'Menunggu' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
];

export function BimbinganScreen({ navigation }: Props) {
  const [items, setItems] = useState<Bimbingan[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<BimbinganStatus | undefined>(undefined);

  const fetchData = useCallback(
    async (page = 1, append = false) => {
      try {
        const response = await bimbinganApi.list({ page, per_page: 15, status: filter });
        if (response.data.success) {
          if (append) {
            setItems((prev) => [...prev, ...response.data.data]);
          } else {
            setItems(response.data.data);
          }
          setMeta(response.data.meta);
        }
      } catch {
        /* silent */
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [filter]
  );

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(1);
  };

  const onEndReached = () => {
    if (!meta || meta.current_page >= meta.last_page || loadingMore) return;
    setLoadingMore(true);
    fetchData(meta.current_page + 1, true);
  };

  if (loading && !refreshing) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <TabHeader title="Bimbingan" subtitle="Catatan & status bimbingan TA" />
      {/* Filter chips */}
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <Chip
            key={f.value ?? 'all'}
            selected={filter === f.value}
            onPress={() => setFilter(f.value)}
            style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
            textStyle={[styles.filterText, filter === f.value && styles.filterTextActive]}
            showSelectedCheck={false}
            compact
          >
            {f.label}
          </Chip>
        ))}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <BimbinganCard
            item={item}
            onPress={() => navigation.navigate('BimbinganDetail', { id: item.id })}
          />
        )}
        ListEmptyComponent={<EmptyState message="Belum ada data bimbingan" />}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={{ marginVertical: 16 }} color={palette.primary} />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[palette.primary]}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        contentContainerStyle={items.length === 0 ? styles.emptyContent : styles.listContent}
      />

      <FAB
        icon={({ size, color }) => <Plus size={size} color={color} strokeWidth={2.4} />}
        onPress={() => navigation.navigate('BimbinganForm', undefined)}
        style={styles.fab}
        color="#fff"
      />
    </View>
  );
}

function BimbinganCard({ item, onPress }: { item: Bimbingan; onPress: () => void }) {
  return (
    <Card mode="elevated" style={styles.card}>
      <TouchableRipple onPress={onPress} borderless={false} rippleColor="rgba(30,108,183,0.08)">
        <View style={styles.cardInner}>
          <Surface elevation={0} style={styles.dateBox}>
            <Calendar size={16} color={palette.primary} strokeWidth={2} />
            <Text variant="labelSmall" style={styles.dateText}>
              {new Date(item.tanggal).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
              })}
            </Text>
            <Text variant="labelSmall" style={styles.yearText}>
              {new Date(item.tanggal).getFullYear()}
            </Text>
          </Surface>
          <View style={{ flex: 1 }}>
            <View style={styles.cardHeader}>
              {item.dosen?.name && (
                <View style={styles.dosenRow}>
                  <GraduationCap size={14} color={palette.primary} strokeWidth={2} />
                  <Text variant="labelMedium" style={styles.dosenName} numberOfLines={1}>
                    {item.dosen.name}
                  </Text>
                </View>
              )}
              <StatusBadge status={item.status} />
            </View>
            <Text variant="bodySmall" style={styles.ket} numberOfLines={2}>
              {item.ket_bimbingan}
            </Text>
          </View>
          <ChevronRight size={18} color={palette.onSurfaceVariant} strokeWidth={2} />
        </View>
      </TouchableRipple>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: '#fff',
    borderColor: palette.outline,
  },
  filterChipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  filterText: { color: palette.onSurfaceVariant, fontSize: 12 },
  filterTextActive: { color: '#fff', fontWeight: '700' },

  listContent: { paddingBottom: 100 },
  emptyContent: { flex: 1, justifyContent: 'center' },

  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  cardInner: {
    flexDirection: 'row',
    padding: 14,
    gap: 12,
    alignItems: 'center',
  },
  dateBox: {
    width: 56,
    backgroundColor: palette.primaryContainer,
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: { color: palette.primary, fontWeight: '700', marginTop: 2 },
  yearText: { color: palette.primary, opacity: 0.7, fontSize: 10 },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  dosenRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  dosenName: { color: palette.primary, fontWeight: '600', flex: 1 },
  ket: { color: palette.onSurfaceVariant },

  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: palette.primary,
    borderRadius: 16,
  },
});
