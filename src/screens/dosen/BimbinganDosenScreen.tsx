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

  const closeAction = () => { setActionId(null); setHasilInput(''); };

  const handleApprove = async (id: number) => {
    try {
      await bimbinganApi.approve(id, hasilInput ? { hasil_bimbingan: hasilInput } : undefined);
      closeAction();
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
      closeAction();
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
      renderItem={({ item }) => {
        const nama = item.mahasiswa?.name ?? 'Mahasiswa tidak diketahui';
        const nim = item.mahasiswa?.nim;
        const tanggal = formatTanggal(item.tanggal);
        const isCreated = item.status === 'created';
        const isReviewing = actionId === item.id;

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

            {/* Tanggal */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Tanggal Bimbingan</Text>
                <Text style={styles.metaValue}>{tanggal}</Text>
              </View>
            </View>

            {/* Keterangan */}
            <Text style={styles.sectionLabel}>Keterangan</Text>
            <Text style={styles.cardKet}>{item.ket_bimbingan}</Text>

            {/* Hasil bimbingan kalau sudah ada */}
            {item.hasil_bimbingan ? (
              <>
                <Text style={[styles.sectionLabel, { marginTop: 10 }]}>Hasil Bimbingan</Text>
                <Text style={styles.cardHasil}>{item.hasil_bimbingan}</Text>
              </>
            ) : null}

            {/* Action area: Review (Approve/Reject) — hanya untuk status created */}
            {isCreated && (
              isReviewing ? (
                <View style={styles.actionArea}>
                  <Text style={styles.sectionLabel}>Hasil Bimbingan</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Tulis hasil bimbingan / catatan..."
                    placeholderTextColor="#aaa"
                    value={hasilInput}
                    onChangeText={setHasilInput}
                    multiline
                  />
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item.id)}>
                      <Text style={styles.approveBtnText}>✓  Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item.id)}>
                      <Text style={styles.rejectBtnText}>✗  Reject</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={closeAction} style={styles.cancelBtn}>
                    <Text style={styles.cancelText}>Batal</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.reviewBtn} onPress={() => setActionId(item.id)}>
                  <Text style={styles.reviewBtnText}>📋  Review Bimbingan</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        );
      }}
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
  cardKet: { fontSize: 13, color: '#444', lineHeight: 19 },
  cardHasil: { fontSize: 13, color: '#2E7D32', lineHeight: 19, fontStyle: 'italic' },

  actionArea: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 70,
    textAlignVertical: 'top',
    color: '#333',
  },
  actionButtons: { flexDirection: 'row', gap: 10, marginTop: 10 },
  approveBtn: { flex: 1, backgroundColor: '#2E7D32', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  approveBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  rejectBtn: { flex: 1, backgroundColor: '#C62828', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  rejectBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', paddingVertical: 8, marginTop: 4 },
  cancelText: { color: '#666', fontSize: 13 },

  reviewBtn: {
    marginTop: 14,
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  reviewBtnText: { color: '#1565C0', fontSize: 14, fontWeight: '700' },
});
