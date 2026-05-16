import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Surface,
  Text,
  TouchableRipple,
} from 'react-native-paper';
import { Bell, BellOff, CheckCheck } from 'lucide-react-native';
import { notifikasiApi } from '../../api/endpoints/notifikasi';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import { palette } from '../../theme';
import { formatNotifikasi } from '../../utils/notifikasi';
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
        if (append) {
          setItems((prev) => [...prev, ...response.data.data]);
        } else {
          setItems(response.data.data);
        }
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

  const handleRead = async (item: Notifikasi) => {
    if (item.read) return;
    try {
      await notifikasiApi.markAsRead(item.id);
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
    } catch {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notifikasiApi.markAllAsRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silent
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Hapus', 'Hapus notifikasi ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await notifikasiApi.delete(id);
            setItems((prev) => prev.filter((n) => n.id !== id));
          } catch {
            // silent
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingScreen />;

  const hasUnread = items.some((n) => !n.read);

  return (
    <View style={styles.container}>
      {hasUnread && (
        <Button
          mode="text"
          onPress={handleMarkAllRead}
          icon={({ size, color }) => <CheckCheck size={size} color={color} strokeWidth={2} />}
          style={styles.markAllBtn}
        >
          Tandai semua sudah dibaca
        </Button>
      )}
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <NotifikasiItem item={item} onRead={handleRead} onDelete={handleDelete} />}
        ListEmptyComponent={
          <EmptyState message="Belum ada notifikasi" />
        }
        ListFooterComponent={
          loadingMore ? <ActivityIndicator style={{ marginVertical: 16 }} color={palette.primary} /> : null
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[palette.primary]} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        contentContainerStyle={items.length === 0 ? styles.emptyContainer : styles.listContent}
      />
    </View>
  );
}

function NotifikasiItem({
  item,
  onRead,
  onDelete,
}: {
  item: Notifikasi;
  onRead: (n: Notifikasi) => void;
  onDelete: (id: number) => void;
}) {
  const { title, message, subtitle } = formatNotifikasi(item);
  const Icon = item.read ? BellOff : Bell;
  const iconColor = item.read ? palette.onSurfaceVariant : palette.primary;
  const time = item.display_time ?? formatTime(item.created_at);

  return (
    <Card
      mode="elevated"
      style={[styles.card, !item.read && styles.unreadCard]}
    >
      <TouchableRipple
        onPress={() => onRead(item)}
        onLongPress={() => onDelete(item.id)}
        borderless={false}
        rippleColor="rgba(30, 108, 183, 0.08)"
      >
        <View style={styles.cardInner}>
          <Surface elevation={0} style={[styles.iconBox, !item.read && styles.iconBoxUnread]}>
            <Icon size={18} color={iconColor} strokeWidth={2} />
          </Surface>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text
                variant="titleSmall"
                style={[styles.title, !item.read && styles.titleUnread]}
                numberOfLines={1}
              >
                {title}
              </Text>
              {!item.read && <View style={styles.dot} />}
            </View>
            {subtitle && (
              <Text variant="bodySmall" style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
            <Text variant="bodySmall" style={styles.message} numberOfLines={2}>
              {message}
            </Text>
            <Text variant="labelSmall" style={styles.time}>
              {time}
            </Text>
          </View>
        </View>
      </TouchableRipple>
    </Card>
  );
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  listContent: { paddingVertical: 8, paddingBottom: 24 },
  markAllBtn: { alignSelf: 'flex-end', marginRight: 8, marginTop: 4 },
  card: {
    marginHorizontal: 16,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  unreadCard: {
    backgroundColor: '#f0f7ff',
  },
  cardInner: {
    flexDirection: 'row',
    padding: 14,
    gap: 12,
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: palette.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxUnread: {
    backgroundColor: palette.primaryContainer,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: palette.onSurface, flex: 1 },
  titleUnread: { fontWeight: '700' },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.primary,
  },
  subtitle: {
    color: palette.primary,
    marginTop: 2,
    fontWeight: '600',
  },
  message: { color: palette.onSurfaceVariant, marginTop: 4 },
  time: { color: palette.onSurfaceVariant, marginTop: 8, opacity: 0.7 },
});
