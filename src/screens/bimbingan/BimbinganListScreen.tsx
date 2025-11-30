import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { FAB, Text, Chip, useTheme } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { bimbinganService } from '../../services/bimbinganService';
import { BimbinganListItem } from '../../components/BimbinganListItem';
import { Bimbingan } from '../../types';
import { COLORS } from '../../utils/constants';

export const BimbinganListScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [bimbingans, setBimbingans] = useState<Bimbingan[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [bimbinganData, statsData] = await Promise.all([
        bimbinganService.getBimbingans(),
        bimbinganService.getStatistics(),
      ]);

      setBimbingans(bimbinganData.sort((a, b) =>
        new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
      ));
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load bimbingan data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Statistics Summary */}
        <View style={styles.statsContainer}>
          <Chip mode="flat" style={styles.statChip}>
            Total: {stats.total}
          </Chip>
          <Chip mode="flat" style={[styles.statChip, { backgroundColor: COLORS.warning }]}>
            Pending: {stats.pending}
          </Chip>
          <Chip mode="flat" style={[styles.statChip, { backgroundColor: COLORS.success }]}>
            Disetujui: {stats.approved}
          </Chip>
          <Chip mode="flat" style={[styles.statChip, { backgroundColor: COLORS.error }]}>
            Ditolak: {stats.rejected}
          </Chip>
        </View>

        {/* Bimbingan List */}
        <View style={styles.listContainer}>
          {bimbingans.length === 0 ? (
            <View style={styles.emptyState}>
              <Text variant="headlineSmall" style={styles.emptyIcon}>
                📚
              </Text>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                Belum ada bimbingan
              </Text>
              <Text variant="bodyMedium" style={styles.emptyDescription}>
                Tap tombol + untuk menambah bimbingan baru
              </Text>
            </View>
          ) : (
            bimbingans.map((bimbingan) => (
              <BimbinganListItem
                key={bimbingan.id}
                bimbingan={bimbingan}
                onPress={() =>
                  navigation.navigate('BimbinganDetail', { id: bimbingan.id })
                }
              />
            ))
          )}
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('CreateBimbingan')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statChip: {
    flexShrink: 1,
  },
  listContainer: {
    paddingBottom: 80,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyDescription: {
    opacity: 0.7,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
