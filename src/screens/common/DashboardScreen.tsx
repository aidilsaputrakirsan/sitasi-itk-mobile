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
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

// ── Tipe data spesifik per role dari backend ──────────────────────────────────

interface MahasiswaDashboard {
  user: { id: number; name: string; nim?: string; judul_ta?: string };
  pengajuan_ta: {
    id: number; judul: string; status: string;
    pembimbing_1?: string; pembimbing_2?: string;
    approve_pembimbing1?: boolean; approve_pembimbing2?: boolean;
  } | null;
  bimbingan: { total: number; approved: number; pending: number };
  sempro: { id: number; status: string; periode?: string; hasil?: string } | null;
  sidang: { id: number; status: string; periode?: string; revisi_lengkap?: boolean } | null;
  jadwal_sempro: { tanggal?: string; waktu?: string; ruangan?: string; penguji_1?: string; penguji_2?: string } | null;
  katalog: { id: number; is_approved: boolean } | null;
  can_create_katalog: boolean;
  active_periode: { sempro?: string; ta?: string };
}

interface DosenDashboard {
  user: { id: number; name: string; nip?: string };
  stats: { total_mahasiswa_bimbingan: number; bimbingan_pending: number; pengajuan_pending: number };
  mahasiswa_bimbingan: { id: number; nama?: string; nim?: string; judul?: string; status: string }[];
  jadwal_menguji: { id: number; mahasiswa?: string; tanggal?: string; waktu?: string; ruangan?: string }[];
}

interface AdminDashboard {
  user: { id: number; name: string };
  stats: {
    total_mahasiswa: number; total_dosen: number;
    pengajuan_ta: { total: number; pending: number; approved: number };
    sempro: { total: number; on_process: number };
    sidang: { total: number; on_process: number; diterima: number };
    katalog: { total: number; pending_approval: number; approved: number };
  };
  active_periode: {
    sempro?: { id: number; periode?: string; gelombang?: string } | null;
    ta?: { id: number; periode?: string; gelombang?: string } | null;
  };
  recent_pengajuan: { id: number; nama?: string; judul?: string; status: string; created_at: string }[];
}

type DashboardData = MahasiswaDashboard | DosenDashboard | AdminDashboard;

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

// ── Main Screen ───────────────────────────────────────────────────────────────

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
        setData(response.data.data as unknown as DashboardData);
      }
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? 'Gagal memuat dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const onRefresh = () => { setRefreshing(true); fetchDashboard(); };

  if (loading && !refreshing) return <LoadingScreen />;
  if (error && !data) return <ErrorMessage message={error} onRetry={fetchDashboard} />;

  const role = getPrimaryRole();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <Text style={styles.greeting}>Selamat Datang,</Text>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.roleText}>
          {role === 'mahasiswa' && `Mahasiswa${user?.nim ? ` · ${user.nim}` : ''}`}
          {role === 'dosen' && 'Dosen Pembimbing'}
          {role === 'tendik' && 'Tenaga Kependidikan'}
          {role === 'koorpro' && 'Koordinator Program'}
        </Text>
      </View>

      {/* Notifikasi banner */}
      {unreadCount > 0 && (
        <TouchableOpacity
          style={styles.notifBanner}
          onPress={() => navigation.navigate('Notifikasi')}
        >
          <Text style={styles.notifText}>
            🔔  {unreadCount} notifikasi belum dibaca — tap untuk lihat
          </Text>
        </TouchableOpacity>
      )}

      {/* Role-specific content */}
      {role === 'mahasiswa' && data && (
        <MahasiswaDashboardView data={data as MahasiswaDashboard} navigation={navigation} />
      )}
      {role === 'dosen' && data && (
        <DosenDashboardView data={data as DosenDashboard} navigation={navigation} />
      )}
      {(role === 'tendik' || role === 'koorpro') && data && (
        <AdminDashboardView data={data as AdminDashboard} navigation={navigation} />
      )}
    </ScrollView>
  );
}

// ── Mahasiswa Dashboard ───────────────────────────────────────────────────────

function MahasiswaDashboardView({ data, navigation }: { data: MahasiswaDashboard; navigation: Props['navigation'] }) {
  return (
    <>
      {/* Bimbingan stats */}
      <SectionTitle title="Bimbingan" />
      <View style={styles.statsRow}>
        <StatBox label="Total" value={String(data.bimbingan.total)} />
        <StatBox label="Disetujui" value={String(data.bimbingan.approved)} color="#2E7D32" />
        <StatBox label="Pending" value={String(data.bimbingan.pending)} color="#E65100" />
      </View>

      {/* Pengajuan TA */}
      {data.pengajuan_ta && (
        <>
          <SectionTitle title="Pengajuan TA" />
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Status</Text>
              <StatusBadge status={data.pengajuan_ta.status} />
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>{data.pengajuan_ta.judul}</Text>
            {data.pengajuan_ta.pembimbing_1 && (
              <Text style={styles.cardMeta}>Pembimbing 1: {data.pengajuan_ta.pembimbing_1}</Text>
            )}
            {data.pengajuan_ta.pembimbing_2 && (
              <Text style={styles.cardMeta}>Pembimbing 2: {data.pengajuan_ta.pembimbing_2}</Text>
            )}
          </View>
        </>
      )}

      {/* Sempro */}
      {data.sempro && (
        <>
          <SectionTitle title="Seminar Proposal" />
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Status</Text>
              <StatusBadge status={data.sempro.status} />
            </View>
            {data.sempro.periode && <Text style={styles.cardMeta}>Periode: {data.sempro.periode}</Text>}
            {data.sempro.hasil && <Text style={styles.cardMeta}>Hasil: {data.sempro.hasil}</Text>}
          </View>
        </>
      )}

      {/* Sidang */}
      {data.sidang && (
        <>
          <SectionTitle title="Sidang TA" />
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Status</Text>
              <StatusBadge status={data.sidang.status} />
            </View>
            {data.sidang.periode && <Text style={styles.cardMeta}>Periode: {data.sidang.periode}</Text>}
            {data.sidang.revisi_lengkap !== undefined && (
              <Text style={[styles.cardMeta, { color: data.sidang.revisi_lengkap ? '#2E7D32' : '#E65100' }]}>
                Revisi: {data.sidang.revisi_lengkap ? 'Semua lengkap' : 'Belum lengkap'}
              </Text>
            )}
          </View>
        </>
      )}

      {/* Jadwal Sempro */}
      {data.jadwal_sempro && (
        <>
          <SectionTitle title="Jadwal Sempro" />
          <View style={[styles.card, styles.jadwalCard]}>
            {data.jadwal_sempro.tanggal && (
              <Text style={styles.jadwalDate}>
                {new Date(data.jadwal_sempro.tanggal).toLocaleDateString('id-ID', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
              </Text>
            )}
            {data.jadwal_sempro.waktu && <Text style={styles.jadwalTime}>{data.jadwal_sempro.waktu}</Text>}
            {data.jadwal_sempro.ruangan && <Text style={styles.cardMeta}>Ruangan: {data.jadwal_sempro.ruangan}</Text>}
            {data.jadwal_sempro.penguji_1 && <Text style={styles.cardMeta}>Penguji 1: {data.jadwal_sempro.penguji_1}</Text>}
            {data.jadwal_sempro.penguji_2 && <Text style={styles.cardMeta}>Penguji 2: {data.jadwal_sempro.penguji_2}</Text>}
          </View>
        </>
      )}

      {/* Aktif Periode */}
      {(data.active_periode?.sempro || data.active_periode?.ta) && (
        <>
          <SectionTitle title="Periode Aktif" />
          <View style={styles.card}>
            {data.active_periode.sempro && (
              <Text style={styles.cardMeta}>Sempro: {data.active_periode.sempro}</Text>
            )}
            {data.active_periode.ta && (
              <Text style={styles.cardMeta}>TA: {data.active_periode.ta}</Text>
            )}
          </View>
        </>
      )}

      {/* Quick menu */}
      <SectionTitle title="Menu Cepat" />
      <View style={styles.menuGrid}>
        <MenuButton label="Bimbingan" onPress={() => navigation.navigate('Bimbingan')} />
        <MenuButton label="Pengajuan TA" onPress={() => navigation.navigate('PengajuanTA')} />
        <MenuButton label="Sempro" onPress={() => navigation.navigate('Sempro')} />
        <MenuButton label="Sidang" onPress={() => navigation.navigate('Sidang')} />
        <MenuButton label="Katalog" onPress={() => navigation.navigate('Katalog')} />
        <MenuButton label="Jadwal" onPress={() => navigation.navigate('Jadwal')} />
      </View>
      <View style={{ height: 24 }} />
    </>
  );
}

// ── Dosen Dashboard ───────────────────────────────────────────────────────────

function DosenDashboardView({ data, navigation }: { data: DosenDashboard; navigation: Props['navigation'] }) {
  return (
    <>
      {/* Stats */}
      <SectionTitle title="Ringkasan" />
      <View style={styles.statsRow}>
        <StatBox label="Mahasiswa Bimbingan" value={String(data.stats.total_mahasiswa_bimbingan)} />
        <StatBox label="Bimbingan Pending" value={String(data.stats.bimbingan_pending)} color="#E65100" />
        <StatBox label="Pengajuan Pending" value={String(data.stats.pengajuan_pending)} color="#E65100" />
      </View>

      {/* Daftar mahasiswa bimbingan */}
      {data.mahasiswa_bimbingan.length > 0 && (
        <>
          <SectionTitle title="Mahasiswa Bimbingan" />
          {data.mahasiswa_bimbingan.map((mhs) => (
            <View key={mhs.id} style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.cardTitle}>{mhs.nama ?? '-'}</Text>
                <StatusBadge status={mhs.status} />
              </View>
              {mhs.nim && <Text style={styles.cardMeta}>NIM: {mhs.nim}</Text>}
              {mhs.judul && <Text style={styles.cardMeta} numberOfLines={2}>{mhs.judul}</Text>}
            </View>
          ))}
        </>
      )}

      {/* Jadwal menguji */}
      {data.jadwal_menguji.length > 0 && (
        <>
          <SectionTitle title="Jadwal Menguji" />
          {data.jadwal_menguji.map((j) => (
            <View key={j.id} style={[styles.card, styles.jadwalCard]}>
              <Text style={styles.cardTitle}>{j.mahasiswa ?? '-'}</Text>
              {j.tanggal && (
                <Text style={styles.jadwalDate}>
                  {new Date(j.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              )}
              {j.waktu && <Text style={styles.jadwalTime}>{j.waktu}</Text>}
              {j.ruangan && <Text style={styles.cardMeta}>Ruangan: {j.ruangan}</Text>}
            </View>
          ))}
        </>
      )}

      {/* Quick menu */}
      <SectionTitle title="Menu Cepat" />
      <View style={styles.menuGrid}>
        <MenuButton label="Bimbingan" onPress={() => navigation.navigate('BimbinganDosen')} />
        <MenuButton label="Pengajuan TA" onPress={() => navigation.navigate('PengajuanDosen')} />
        <MenuButton label="Sempro" onPress={() => navigation.navigate('SemproDosen')} />
        <MenuButton label="Sidang" onPress={() => navigation.navigate('SidangDosen')} />
      </View>
      <View style={{ height: 24 }} />
    </>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────

function AdminDashboardView({ data, navigation }: { data: AdminDashboard; navigation: Props['navigation'] }) {
  return (
    <>
      {/* Overview stats */}
      <SectionTitle title="Overview" />
      <View style={styles.statsRow}>
        <StatBox label="Mahasiswa" value={String(data.stats.total_mahasiswa)} />
        <StatBox label="Dosen" value={String(data.stats.total_dosen)} />
      </View>

      {/* Pengajuan TA */}
      <SectionTitle title="Pengajuan TA" />
      <View style={styles.statsRow}>
        <StatBox label="Total" value={String(data.stats.pengajuan_ta.total)} />
        <StatBox label="Pending" value={String(data.stats.pengajuan_ta.pending)} color="#E65100" />
        <StatBox label="Disetujui" value={String(data.stats.pengajuan_ta.approved)} color="#2E7D32" />
      </View>

      {/* Sempro & Sidang */}
      <SectionTitle title="Sempro & Sidang" />
      <View style={styles.statsRow}>
        <StatBox label="Sempro Total" value={String(data.stats.sempro.total)} />
        <StatBox label="Sempro Proses" value={String(data.stats.sempro.on_process)} color="#1565C0" />
      </View>
      <View style={styles.statsRow}>
        <StatBox label="Sidang Total" value={String(data.stats.sidang.total)} />
        <StatBox label="Proses" value={String(data.stats.sidang.on_process)} color="#1565C0" />
        <StatBox label="Diterima" value={String(data.stats.sidang.diterima)} color="#2E7D32" />
      </View>

      {/* Katalog */}
      <SectionTitle title="Katalog TA" />
      <View style={styles.statsRow}>
        <StatBox label="Total" value={String(data.stats.katalog.total)} />
        <StatBox label="Pending" value={String(data.stats.katalog.pending_approval)} color="#E65100" />
        <StatBox label="Disetujui" value={String(data.stats.katalog.approved)} color="#2E7D32" />
      </View>

      {/* Periode aktif */}
      {(data.active_periode?.sempro || data.active_periode?.ta) && (
        <>
          <SectionTitle title="Periode Aktif" />
          <View style={styles.card}>
            {data.active_periode.sempro && (
              <>
                <Text style={styles.cardLabel}>Sempro</Text>
                <Text style={styles.cardTitle}>{data.active_periode.sempro.periode ?? '-'}</Text>
                {data.active_periode.sempro.gelombang && (
                  <Text style={styles.cardMeta}>Gelombang: {data.active_periode.sempro.gelombang}</Text>
                )}
              </>
            )}
            {data.active_periode.ta && (
              <>
                <Text style={[styles.cardLabel, { marginTop: 12 }]}>TA</Text>
                <Text style={styles.cardTitle}>{data.active_periode.ta.periode ?? '-'}</Text>
                {data.active_periode.ta.gelombang && (
                  <Text style={styles.cardMeta}>Gelombang: {data.active_periode.ta.gelombang}</Text>
                )}
              </>
            )}
          </View>
        </>
      )}

      {/* Recent pengajuan */}
      {data.recent_pengajuan.length > 0 && (
        <>
          <SectionTitle title="Pengajuan Terbaru" />
          {data.recent_pengajuan.map((p) => (
            <View key={p.id} style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.cardTitle}>{p.nama ?? '-'}</Text>
                <StatusBadge status={p.status} />
              </View>
              <Text style={styles.cardMeta} numberOfLines={2}>{p.judul ?? '-'}</Text>
              <Text style={styles.cardDate}>
                {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            </View>
          ))}
        </>
      )}

      {/* Quick menu */}
      <SectionTitle title="Menu Cepat" />
      <View style={styles.menuGrid}>
        <MenuButton label="Kelola User" onPress={() => navigation.navigate('UserManagement')} />
        <MenuButton label="Periode" onPress={() => navigation.navigate('Periode')} />
        <MenuButton label="Jadwal" onPress={() => navigation.navigate('JadwalAdmin')} />
        <MenuButton label="Katalog" onPress={() => navigation.navigate('KatalogAdmin')} />
      </View>
      <View style={{ height: 24 }} />
    </>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function StatBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <Text style={styles.menuButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },

  welcomeCard: {
    backgroundColor: '#0066CC',
    margin: 16,
    marginBottom: 8,
    padding: 24,
    borderRadius: 16,
  },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  userName: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 4 },
  roleText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },

  notifBanner: {
    backgroundColor: '#FFF3E0',
    marginHorizontal: 16,
    marginBottom: 4,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  notifText: { color: '#E65100', fontSize: 13, fontWeight: '500' },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },

  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 10,
    marginBottom: 4,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: { fontSize: 24, fontWeight: '800', color: '#0066CC' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 4, textAlign: 'center' },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 4,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  jadwalCard: { borderLeftWidth: 4, borderLeftColor: '#0066CC' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardLabel: { fontSize: 12, color: '#999', textTransform: 'uppercase', fontWeight: '600', letterSpacing: 0.5 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#333', flex: 1, marginRight: 8 },
  cardMeta: { fontSize: 13, color: '#666', marginTop: 4 },
  cardDate: { fontSize: 11, color: '#aaa', marginTop: 6 },

  jadwalDate: { fontSize: 14, fontWeight: '600', color: '#333' },
  jadwalTime: { fontSize: 13, color: '#0066CC', marginTop: 2 },

  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 12,
    gap: 10,
  },
  menuButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuButtonText: { fontSize: 14, fontWeight: '600', color: '#0066CC' },
});
