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
import { bimbinganApi } from '../../api/endpoints/bimbingan';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Bimbingan, PaginationMeta } from '../../types';

export function BimbinganDosenScreen() {
  const [items, setItems] = useState<Bimbingan[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [hasilInput, setHasilInput] = useState('');

  const fetchData = useCallback(async (page = 1, append = false) => {
    try {
      const response = await bimbinganApi.list({ page, per_page: 15 });
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

  const handleApprove = async (id: number) => {
    try {
      await bimbinganApi.approve(id, hasilInput ? { hasil_bimbingan: hasilInput } : undefined);
      setActionId(null);
      setHasilInput('');
      fetchData(1);
    } catch (err: unknown) {
      Alert.alert('Gagal', (err as { message?: string }).message ?? 'Gagal approve');
    }
  };

  const handleReject = async (id: number) => {
    if (!hasilInput.trim()) {
      Alert.alert('Error', 'Hasil bimbingan harus diisi untuk reject');
      return;
    }
    try {
      await bimbinganApi.reject(id, { hasil_bimbingan: hasilInput });
      setActionId(null);
      setHasilInput('');
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
            <Text style={styles.cardDate}>
              {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
            <StatusBadge status={item.status} />
          </View>
          {item.mahasiswa && (
            <Text style={styles.cardMhs}>{item.mahasiswa.nama} ({item.mahasiswa.nim})</Text>
          )}
          <Text style={styles.cardKet} numberOfLines={3}>{item.ket_bimbingan}</Text>
          {item.hasil_bimbingan && (
            <Text style={styles.cardHasil}>Hasil: {item.hasil_bimbingan}</Text>
          )}

          {item.status === 'created' && (
            actionId === item.id ? (
              <View style={styles.actionArea}>
                <TextInput
                  style={styles.input}
                  placeholder="Hasil bimbingan..."
                  value={hasilInput}
                  onChangeText={setHasilInput}
                  multiline
                />
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item.id)}>
                    <Text style={styles.approveBtnText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item.id)}>
                    <Text style={styles.rejectBtnText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setActionId(null); setHasilInput(''); }}>
                    <Text style={styles.cancelText}>Batal</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.reviewBtn} onPress={() => setActionId(item.id)}>
                <Text style={styles.reviewBtnText}>Review</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      )}
      ListEmptyComponent={<EmptyState message="Belum ada bimbingan" />}
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
  cardDate: { fontSize: 14, fontWeight: '600', color: '#333' },
  cardMhs: { fontSize: 13, color: '#0066CC', marginTop: 6, fontWeight: '500' },
  cardKet: { fontSize: 13, color: '#666', marginTop: 4 },
  cardHasil: { fontSize: 13, color: '#2E7D32', marginTop: 4, fontStyle: 'italic' },
  actionArea: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 },
  input: { backgroundColor: '#F5F7FA', borderRadius: 8, padding: 10, fontSize: 14, borderWidth: 1, borderColor: '#E0E0E0', minHeight: 60 },
  actionButtons: { flexDirection: 'row', gap: 10, marginTop: 10, alignItems: 'center' },
  approveBtn: { backgroundColor: '#2E7D32', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  approveBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  rejectBtn: { backgroundColor: '#C62828', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  rejectBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  cancelText: { color: '#666', fontSize: 13, paddingHorizontal: 8 },
  reviewBtn: { marginTop: 10, backgroundColor: '#E3F2FD', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  reviewBtnText: { color: '#1565C0', fontSize: 13, fontWeight: '600' },
});
