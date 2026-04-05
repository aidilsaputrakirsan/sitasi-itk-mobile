import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { usersApi } from '../../api/endpoints/users';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import type { User, PaginationMeta } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props {
  navigation: NativeStackNavigationProp<Record<string, object | undefined>>;
}

export function UserManagementScreen({ navigation }: Props) {
  const [items, setItems] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);

  const fetchData = useCallback(async (page = 1, append = false) => {
    try {
      const response = await usersApi.list({
        page,
        per_page: 20,
        search: search || undefined,
        role: roleFilter,
      });
      if (response.data.success) {
        setItems(append ? (prev) => [...prev, ...response.data.data] : response.data.data);
        setMeta(response.data.meta);
      }
    } catch { /* silent */ } finally {
      setLoading(false); setRefreshing(false); setLoadingMore(false);
    }
  }, [search, roleFilter]);

  useEffect(() => { setLoading(true); fetchData(); }, [fetchData]);
  const onRefresh = () => { setRefreshing(true); fetchData(1); };
  const onEndReached = () => {
    if (!meta || meta.current_page >= meta.last_page || loadingMore) return;
    setLoadingMore(true); fetchData(meta.current_page + 1, true);
  };

  /**
   * Handles the deletion of a user with confirmation dialog
   * @param id - The unique identifier of the user to be deleted
   * @param name - The name of the user to be deleted
   */
  const handleDelete = (id: number, name: string) => {
    // Show confirmation alert dialog
    Alert.alert('Hapus User', `Hapus user "${name}"?`, [ // Cancel button
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive', onPress: async () => {
          try {
            await usersApi.delete(id);
            setItems((prev) => prev.filter((u) => u.id !== id));
          } catch (err: unknown) {
            Alert.alert('Gagal', (err as { message?: string }).message ?? 'Gagal menghapus user');
          }
        },
      },
    ]);
  };

  if (loading && !refreshing) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama, email, NIM..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => { setLoading(true); fetchData(1); }}
          returnKeyType="search"
        />
      </View>
      <View style={styles.filterRow}>
        {[undefined, 'mahasiswa', 'dosen', 'tendik', 'koorpro'].map((r) => (
          <TouchableOpacity
            key={r ?? 'all'}
            style={[styles.filterChip, roleFilter === r && styles.filterActive]}
            onPress={() => setRoleFilter(r)}
          >
            <Text style={[styles.filterText, roleFilter === r && styles.filterTextActive]}>
              {r ? r.charAt(0).toUpperCase() + r.slice(1) : 'Semua'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('UserDetail', { id: item.id })}
            onLongPress={() => handleDelete(item.id, item.name)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardName}>{item.name}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText2}>{item.roles.join(', ')}</Text>
              </View>
            </View>
            <Text style={styles.cardEmail}>{item.email}</Text>
            {item.nim && <Text style={styles.cardSub}>NIM: {item.nim}</Text>}
            {item.nip && <Text style={styles.cardSub}>NIP: {item.nip}</Text>}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState message="Tidak ada user ditemukan" />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        contentContainerStyle={items.length === 0 ? { flex: 1 } : { paddingHorizontal: 16, paddingBottom: 16 }}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('UserForm')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  searchBar: { padding: 16, paddingBottom: 8 },
  searchInput: { backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1, borderColor: '#E0E0E0' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 8, gap: 6 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0' },
  filterActive: { backgroundColor: '#0066CC', borderColor: '#0066CC' },
  filterText: { fontSize: 12, color: '#666' },
  filterTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', marginBottom: 8, padding: 14, borderRadius: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 15, fontWeight: '600', color: '#333', flex: 1 },
  roleBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  roleText2: { fontSize: 11, color: '#1565C0', fontWeight: '600', textTransform: 'capitalize' },
  cardEmail: { fontSize: 13, color: '#666', marginTop: 4 },
  cardSub: { fontSize: 12, color: '#999', marginTop: 2 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0066CC', justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
});
