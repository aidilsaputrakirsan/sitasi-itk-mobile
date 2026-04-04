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
import { notifikasiApi } from '../../api/endpoints/notifikasi';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Notifikasi, PaginationMeta } from '../../types';

export function NotifikasiScreen() {
  const [items, setItems] = useState<Notifikasi[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchData = useCallback(async (page = 1, append = false) => {
    try {
      const response = await notifikasiApi.list({ page, per_page: 20 });
      if (response.data.success) {
        setItems(append ? (prev) => [...prev, ...response.data.data] : response.data.data);
        setMeta(response.data.meta);
      }
    } catch {
      // Silent
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(1); };

  const onEndReached = () => {
    if (!meta || meta.current_page >= meta.last_page || loadingMore) return;
    setLoadingMore(true);
    fetchData(meta.current_page + 1, true);
  };

  const handleRead = async (item: Notifikasi) => {
    if (!item.read_at) {
      try {
        await notifikasiApi.markAsRead(item.id);
        setItems((prev) => prev.map((n) => n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n));
      } catch { /* silent */ }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notifikasiApi.markAllAsRead();
      setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    } catch { /* silent */ }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Hapus', 'Hapus notifikasi ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive', onPress: async () => {
          try {
            await notifikasiApi.delete(id);
            setItems((prev) => prev.filter((n) => n.id !== id));
          } catch { /* silent */ }
        },
      },
    ]);
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      {items.some((n) => !n.read_at) && (
        <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllRead}>
          <Text style={styles.markAllText}>Tandai semua sudah dibaca</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.read_at && styles.unread]}
            onPress={() => handleRead(item)}
            onLongPress={() => handleDelete(item.id)}
          >
            <Text style={styles.notifTitle}>{item.title}</Text>
            <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
            <Text style={styles.notifTime}>
              {new Date(item.created_at).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState message="Belum ada notifikasi" />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        contentContainerStyle={items.length === 0 ? { flex: 1 } : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  markAllButton: { padding: 12, alignItems: 'center' },
  markAllText: { color: '#0066CC', fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  unread: { borderLeftColor: '#0066CC', backgroundColor: '#F0F7FF' },
  notifTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  notifMessage: { fontSize: 13, color: '#666', marginTop: 4 },
  notifTime: { fontSize: 11, color: '#999', marginTop: 8 },
});
