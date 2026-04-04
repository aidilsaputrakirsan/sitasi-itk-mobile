import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { dashboardApi } from '../../api/endpoints/dashboard';
import { useNotificationCount } from '../../hooks/useNotification';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import type { DashboardData } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Props {
  navigation: NativeStackNavigationProp<Record<string, undefined>>;
}

export function DashboardScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const getPrimaryRole = useAuthStore((s) => s.getPrimaryRole);
  const { unreadCount } = useNotificationCount();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);
      const response = await dashboardApi.get();
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? 'Gagal memuat dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading && !refreshing) return <LoadingScreen />;
  if (error && !data) return <ErrorMessage message={error} onRetry={fetchDashboard} />;

  const role = getPrimaryRole();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.welcomeCard}>
        <Text style={styles.greeting}>Selamat Datang,</Text>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.roleText}>
          {role === 'mahasiswa' && `Mahasiswa - ${user?.nim ?? ''}`}
          {role === 'dosen' && 'Dosen Pembimbing'}
          {role === 'tendik' && 'Tenaga Kependidikan'}
          {role === 'koorpro' && 'Koordinator Program'}
        </Text>
      </View>

      {unreadCount > 0 && (
        <TouchableOpacity
          style={styles.notifBanner}
          onPress={() => navigation.navigate('Notifikasi')}
        >
          <Text style={styles.notifText}>
            Anda memiliki {unreadCount} notifikasi belum dibaca
          </Text>
        </TouchableOpacity>
      )}

      {role === 'mahasiswa' && <MahasiswaQuickMenu navigation={navigation} />}
      {role === 'dosen' && <DosenQuickMenu navigation={navigation} />}
      {(role === 'tendik' || role === 'koorpro') && <AdminQuickMenu navigation={navigation} />}

      {data && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ringkasan</Text>
          {Object.entries(data).map(([key, value]) => (
            <View key={key} style={styles.statRow}>
              <Text style={styles.statLabel}>{key.replace(/_/g, ' ')}</Text>
              <Text style={styles.statValue}>{String(value)}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function QuickMenuButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <Text style={styles.menuButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function MahasiswaQuickMenu({ navigation }: { navigation: Props['navigation'] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Menu Cepat</Text>
      <View style={styles.menuGrid}>
        <QuickMenuButton label="Bimbingan" onPress={() => navigation.navigate('Bimbingan')} />
        <QuickMenuButton label="Pengajuan TA" onPress={() => navigation.navigate('PengajuanTA')} />
        <QuickMenuButton label="Sempro" onPress={() => navigation.navigate('Sempro')} />
        <QuickMenuButton label="Sidang" onPress={() => navigation.navigate('Sidang')} />
        <QuickMenuButton label="Katalog" onPress={() => navigation.navigate('Katalog')} />
        <QuickMenuButton label="Jadwal" onPress={() => navigation.navigate('Jadwal')} />
      </View>
    </View>
  );
}

function DosenQuickMenu({ navigation }: { navigation: Props['navigation'] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Menu Cepat</Text>
      <View style={styles.menuGrid}>
        <QuickMenuButton label="Bimbingan" onPress={() => navigation.navigate('BimbinganDosen')} />
        <QuickMenuButton label="Pengajuan TA" onPress={() => navigation.navigate('PengajuanDosen')} />
        <QuickMenuButton label="Sempro" onPress={() => navigation.navigate('SemproDosen')} />
        <QuickMenuButton label="Sidang" onPress={() => navigation.navigate('SidangDosen')} />
      </View>
    </View>
  );
}

function AdminQuickMenu({ navigation }: { navigation: Props['navigation'] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Menu Cepat</Text>
      <View style={styles.menuGrid}>
        <QuickMenuButton label="Kelola User" onPress={() => navigation.navigate('UserManagement')} />
        <QuickMenuButton label="Periode" onPress={() => navigation.navigate('Periode')} />
        <QuickMenuButton label="Jadwal" onPress={() => navigation.navigate('JadwalAdmin')} />
        <QuickMenuButton label="Katalog" onPress={() => navigation.navigate('KatalogAdmin')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  welcomeCard: {
    backgroundColor: '#0066CC',
    margin: 16,
    padding: 24,
    borderRadius: 16,
  },
  greeting: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  userName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  roleText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 4,
  },
  notifBanner: {
    backgroundColor: '#FFF3E0',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    marginBottom: 8,
  },
  notifText: {
    color: '#E65100',
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  menuButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066CC',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#555',
    textTransform: 'capitalize',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
});
