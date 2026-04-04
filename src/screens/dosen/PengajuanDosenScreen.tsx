import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { pengajuanTAApi } from '../../api/endpoints/pengajuanTA';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import type { PengajuanTA, PaginationMeta } from '../../types';

export function PengajuanDosenScreen() {
  const [items, setItems] = useState<PengajuanTA[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [keterangan, setKeterangan] = useState('');

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

  const handleApprove = (id: number) => {
    Alert.alert('Approve', 'Setujui pengajuan TA ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Approve', onPress: async () => {
          try {
            await pengajuanTAApi.approve(id);
            fetchData(1);
          } catch (err: unknown) {
            Alert.alert('Gagal', (err as { message?: string }).message ?? 'Gagal approve');
          }
        },
      },
    ]);
  };

  const handleReject = async (id: number) => {
    if (!keterangan.trim()) {
      Alert.alert('Error', 'Keterangan harus diisi');
      return;
    }
    try {
      await pengajuanTAApi.reject(id, { keterangan });
      setRejectId(null);
      setKeterangan('');
      fetchData(1);
    } catch (err: unknown) {
      Alert.alert('Gagal', (err as { message?: string }).message ?? 'Gagal reject');
    }
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
          <Text style={styles.cardTitle} numberOfLines={2}>{item.judul}</Text>
          {item.mahasiswa && (
            <Text style={styles.cardMhs}>{item.mahasiswa.nama} ({item.mahasiswa.nim})</Text>
          )}
          <Text style={styles.cardField}>{item.bidang_penelitian}</Text>

          {item.status === 'pending' && (
            <View style={styles.actions}>
              <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item.id)}>
                <Text style={styles.btnText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => setRejectId(rejectId === item.id ? null : item.id)}
              >
                <Text style={styles.rejectBtnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}

          {rejectId === item.id && (
            <View style={styles.rejectForm}>
              <TextInput
                style={styles.input}
                placeholder="Alasan penolakan..."
                value={keterangan}
                onChangeText={setKeterangan}
                multiline
              />
              <TouchableOpacity style={styles.submitRejectBtn} onPress={() => handleReject(item.id)}>
                <Text style={styles.btnText}>Kirim Penolakan</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      ListEmptyComponent={<EmptyState message="Belum ada pengajuan TA" />}
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
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  cardMhs: { fontSize: 13, color: '#0066CC', marginTop: 4, fontWeight: '500' },
  cardField: { fontSize: 13, color: '#666', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  approveBtn: { flex: 1, backgroundColor: '#2E7D32', padding: 10, borderRadius: 8, alignItems: 'center' },
  rejectBtn: { flex: 1, backgroundColor: '#FFEBEE', padding: 10, borderRadius: 8, alignItems: 'center' },
  rejectBtnText: { color: '#C62828', fontSize: 13, fontWeight: '600' },
  btnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  rejectForm: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 },
  input: { backgroundColor: '#F5F7FA', borderRadius: 8, padding: 10, fontSize: 14, borderWidth: 1, borderColor: '#E0E0E0', minHeight: 60 },
  submitRejectBtn: { backgroundColor: '#C62828', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
});
