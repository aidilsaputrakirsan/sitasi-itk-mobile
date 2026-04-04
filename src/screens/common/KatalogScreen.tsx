import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { katalogApi } from '../../api/endpoints/katalog';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Katalog, PaginationMeta } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props {
  navigation: NativeStackNavigationProp<Record<string, object | undefined>>;
}

export function KatalogScreen({ navigation }: Props) {
  const [items, setItems] = useState<Katalog[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async (page = 1, append = false, searchQuery?: string) => {
    try {
      const response = await katalogApi.list({
        page,
        per_page: 15,
        search: searchQuery ?? (search || undefined),
      });
      if (response.data.success) {
        setItems(append ? (prev) => [...prev, ...response.data.data] : response.data.data);
        setMeta(response.data.meta);
      }
    } catch { /* silent */ } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(1); };

  const onEndReached = () => {
    if (!meta || meta.current_page >= meta.last_page || loadingMore) return;
    setLoadingMore(true);
    fetchData(meta.current_page + 1, true);
  };

  const handleSearch = () => { setLoading(true); fetchData(1, false, search); };

  if (loading && !refreshing) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari judul TA..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('KatalogDetail', { id: item.id })}
          >
            <Text style={styles.cardTitle} numberOfLines={2}>{item.judul}</Text>
            {item.mahasiswa && (
              <Text style={styles.cardSub}>{item.mahasiswa.nama} - {item.mahasiswa.nim}</Text>
            )}
            {item.tahun && <Text style={styles.cardYear}>Tahun: {item.tahun}</Text>}
            {item.kata_kunci && (
              <Text style={styles.cardKeywords} numberOfLines={1}>{item.kata_kunci}</Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState message="Belum ada katalog tugas akhir" />}
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
  searchBar: { padding: 16, paddingBottom: 8 },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  cardSub: { fontSize: 13, color: '#666', marginTop: 6 },
  cardYear: { fontSize: 12, color: '#999', marginTop: 4 },
  cardKeywords: { fontSize: 12, color: '#0066CC', marginTop: 4 },
});
