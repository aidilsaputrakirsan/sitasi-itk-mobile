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
import { semproApi } from '../../api/endpoints/sempro';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Sempro, PaginationMeta } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

// Backend menyimpan revisi sebagai datetime|null. Kita derive ke flag boolean
// + label rapi supaya bisa dirender sebagai chip yang konsisten.
type RevisiRole = 'pembimbing_1' | 'pembimbing_2' | 'penguji_1' | 'penguji_2';
const REVISI_ROLES: { key: RevisiRole; label: string; field: keyof Sempro }[] = [
  { key: 'pembimbing_1', label: 'Pembimbing 1', field: 'revisi_pembimbing_1' },
  { key: 'pembimbing_2', label: 'Pembimbing 2', field: 'revisi_pembimbing_2' },
  { key: 'penguji_1', label: 'Penguji 1', field: 'revisi_penguji_1' },
  { key: 'penguji_2', label: 'Penguji 2', field: 'revisi_penguji_2' },
];

function formatTanggal(iso?: string): string {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return '-';
  }
}

export function SemproDosenScreen({ navigation }: Props) {
  const [items, setItems] = useState<Sempro[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchData = useCallback(async (page = 1, append = false) => {
    try {
      const response = await semproApi.list({ page, per_page: 15 });
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

  const handleRevisi = (id: number, role: RevisiRole, currentDone: boolean) => {
    const nextLabel = currentDone ? 'belum selesai' : 'selesai';
    Alert.alert(
      'Update Revisi',
      `Tandai revisi ${role.replace(/_/g, ' ')} sebagai ${nextLabel}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya', onPress: async () => {
            try {
              await semproApi.submitRevisi(id, { role, status: !currentDone });
              fetchData(1);
            } catch (err: unknown) {
              Alert.alert('Gagal', (err as { message?: string }).message ?? 'Gagal update revisi');
            }
          },
        },
      ],
    );
  };

  if (loading && !refreshing) return <LoadingScreen />;

  return (
    <FlatList
      style={styles.container}
      data={items}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => {
        const nama = item.user?.name ?? 'Mahasiswa tidak diketahui';
        const nim = item.user?.nim;
        const periode = item.periode?.periode;
        const tanggal = formatTanggal(item.tanggal ?? item.created_at);

        return (
          <View style={styles.card}>
            {/* Header: nama mahasiswa + status */}
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <Text style={styles.mhsName} numberOfLines={1}>{nama}</Text>
                {nim ? <Text style={styles.mhsNim}>NIM {nim}</Text> : null}
              </View>
              <StatusBadge status={item.status} />
            </View>

            {/* Meta info */}
            <View style={styles.metaRow}>
              {periode ? (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Periode</Text>
                  <Text style={styles.metaValue} numberOfLines={1}>{periode}</Text>
                </View>
              ) : null}
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Tanggal</Text>
                <Text style={styles.metaValue}>{tanggal}</Text>
              </View>
            </View>

            {/* Revisi chips */}
            <Text style={styles.sectionLabel}>Status Revisi</Text>
            <View style={styles.revisiContainer}>
              {REVISI_ROLES.map(({ key, label, field }) => {
                const done = !!item[field];
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.revisiChip, done ? styles.revisiDone : styles.revisiPending]}
                    onPress={() => handleRevisi(item.id, key, done)}
                  >
                    <Text style={[styles.revisiText, done ? styles.revisiDoneText : styles.revisiPendingText]}>
                      {done ? '✓' : '○'}  {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Action button */}
            <TouchableOpacity
              style={styles.nilaiBtn}
              onPress={() =>
                navigation.navigate('PenilaianForm', {
                  type: 'sempro',
                  targetId: item.id,
                  mahasiswaName: nama,
                })
              }
            >
              <Text style={styles.nilaiBtnText}>📝  Beri Nilai</Text>
            </TouchableOpacity>
          </View>
        );
      }}
      ListEmptyComponent={<EmptyState message="Belum ada data sempro" />}
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
    marginBottom: 12,
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  headerLeft: { flex: 1 },
  mhsName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  mhsNim: { fontSize: 12, color: '#888', marginTop: 2 },

  metaRow: {
    flexDirection: 'row',
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 12,
  },
  metaItem: { flex: 1 },
  metaLabel: { fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' },
  metaValue: { fontSize: 13, color: '#333', marginTop: 2, fontWeight: '500' },

  sectionLabel: {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
    marginBottom: 6,
  },
  revisiContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  revisiChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  revisiDone: { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' },
  revisiPending: { backgroundColor: '#FFF8E1', borderColor: '#FFECB3' },
  revisiText: { fontSize: 11, fontWeight: '600' },
  revisiDoneText: { color: '#2E7D32' },
  revisiPendingText: { color: '#E65100' },

  nilaiBtn: {
    marginTop: 14,
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  nilaiBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
