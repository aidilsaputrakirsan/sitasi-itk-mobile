import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  ActivityIndicator,
  Card,
  FAB,
  Surface,
  Text,
  TouchableRipple,
} from 'react-native-paper';
import {
  ChevronRight,
  FileText,
  Plus,
  Tag,
} from 'lucide-react-native';
import { pengajuanTAApi } from '../../api/endpoints/pengajuanTA';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import { palette } from '../../theme';
import type { PengajuanTA, PaginationMeta } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList>;
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
  }, []);

  useEffect(() => {
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
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PengajuanCard
            item={item}
            onPress={() => navigation.navigate('PengajuanTADetail', { id: item.id })}
          />
        )}
        ListEmptyComponent={
          <EmptyState message="Belum ada pengajuan TA. Ketuk + untuk mengajukan." />
        }
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
        contentContainerStyle={
          items.length === 0 ? styles.emptyContent : styles.listContent
        }
      />
      <FAB
        icon={({ size, color }) => <Plus size={size} color={color} strokeWidth={2.4} />}
        onPress={() => navigation.navigate('PengajuanTAForm', undefined)}
        style={styles.fab}
        color="#fff"
      />
    </View>
  );
}

function PengajuanCard({ item, onPress }: { item: PengajuanTA; onPress: () => void }) {
  const pembimbingCount =
    (item.pembimbing_1 ? 1 : 0) + (item.pembimbing_2 ? 1 : 0);
  return (
    <Card mode="elevated" style={styles.card}>
      <TouchableRipple onPress={onPress} borderless={false} rippleColor="rgba(30,108,183,0.08)">
        <View style={styles.cardInner}>
          {/* Status row */}
          <View style={styles.headerRow}>
            <View style={styles.bidangRow}>
              <Tag size={12} color={palette.primary} strokeWidth={2.2} />
              <Text variant="labelSmall" style={styles.bidang} numberOfLines={1}>
                {item.bidang_penelitian}
              </Text>
            </View>
            <StatusBadge status={item.status} />
          </View>

          {/* Judul */}
          <View style={styles.judulRow}>
            <FileText size={16} color={palette.onSurfaceVariant} strokeWidth={1.8} />
            <Text variant="titleSmall" style={styles.judul} numberOfLines={2}>
              {item.judul}
            </Text>
          </View>

          {/* Pembimbing */}
          {pembimbingCount > 0 && (
            <View style={styles.pembimbingSection}>
              {item.pembimbing_1?.name && (
                <View style={styles.pembimbingRow}>
                  <Surface elevation={0} style={styles.pembimbingBadge}>
                    <Text variant="labelSmall" style={styles.pembimbingBadgeText}>P1</Text>
                  </Surface>
                  <Text variant="bodySmall" style={styles.pembimbingName} numberOfLines={1}>
                    {item.pembimbing_1.name}
                  </Text>
                  {item.approve_pembimbing1 && <ApprovalDot />}
                </View>
              )}
              {item.pembimbing_2?.name && (
                <View style={styles.pembimbingRow}>
                  <Surface elevation={0} style={styles.pembimbingBadge}>
                    <Text variant="labelSmall" style={styles.pembimbingBadgeText}>P2</Text>
                  </Surface>
                  <Text variant="bodySmall" style={styles.pembimbingName} numberOfLines={1}>
                    {item.pembimbing_2.name}
                  </Text>
                  {item.approve_pembimbing2 && <ApprovalDot />}
                </View>
              )}
            </View>
          )}

          {/* Chevron footer */}
          <View style={styles.chevronRow}>
            <Text variant="labelSmall" style={styles.detailLink}>
              Lihat detail
            </Text>
            <ChevronRight size={14} color={palette.primary} strokeWidth={2} />
          </View>
        </View>
      </TouchableRipple>
    </Card>
  );
}

function ApprovalDot() {
  return (
    <Surface elevation={0} style={styles.approvalDot}>
      <Text variant="labelSmall" style={styles.approvalDotText}>✓</Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  listContent: { padding: 16, paddingBottom: 100 },
  emptyContent: { flex: 1, justifyContent: 'center' },

  card: { marginBottom: 12, backgroundColor: '#fff', borderRadius: 12 },
  cardInner: { padding: 14 },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  bidangRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    backgroundColor: palette.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    maxWidth: '70%',
  },
  bidang: { color: palette.primary, fontWeight: '600' },

  judulRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  judul: { color: palette.onSurface, fontWeight: '600', flex: 1, lineHeight: 20 },

  pembimbingSection: { gap: 6, marginBottom: 10 },
  pembimbingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pembimbingBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: palette.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pembimbingBadgeText: {
    color: palette.onSurfaceVariant,
    fontWeight: '700',
    fontSize: 10,
  },
  pembimbingName: { color: palette.onSurface, flex: 1 },
  approvalDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: palette.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approvalDotText: { color: '#fff', fontWeight: '800', fontSize: 10 },

  chevronRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: palette.outlineVariant,
  },
  detailLink: { color: palette.primary, fontWeight: '600', flex: 1 },

  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: palette.primary,
    borderRadius: 16,
  },
});
