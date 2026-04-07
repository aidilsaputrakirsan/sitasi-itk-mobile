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
import { semproApi } from '../../api/endpoints/sempro';
import { penilaianApi } from '../../api/endpoints/penilaian';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import type { PenilaianListItemSempro, PenilaianListType } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

type RevisiRole = 'pembimbing_1' | 'pembimbing_2' | 'penguji_1' | 'penguji_2';

/** Field revisi pada sempro yang sesuai dengan role dosen yang sedang login */
function revisiFieldFor(role: RevisiRole): keyof PenilaianListItemSempro {
  return `revisi_${role}` as keyof PenilaianListItemSempro;
}

const FILTER_TABS: { key: PenilaianListType; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'bimbingan', label: 'Bimbingan' },
  { key: 'uji', label: 'Menguji' },
];

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

export function SemproDosenScreen({ navigation }: Props) {
  const [items, setItems] = useState<PenilaianListItemSempro[]>([]);
  const [filter, setFilter] = useState<PenilaianListType>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (type: PenilaianListType) => {
    try {
      const response = await penilaianApi.listSempro(type);
      if (response.data.success) {
        setItems(response.data.data);
      }
    } catch { /* silent */ } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchData(filter);
  }, [fetchData, filter]);

  const onRefresh = () => { setRefreshing(true); fetchData(filter); };

  const handleSetujuiRevisi = (id: number, role: RevisiRole) => {
    Alert.alert(
      'Setujui Revisi',
      `Setujui hasil revisi sempro mahasiswa sebagai ${role.replace(/_/g, ' ')}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Setujui', onPress: async () => {
            try {
              await semproApi.submitRevisi(id, { role, status: true });
              fetchData(filter);
            } catch (err: unknown) {
              Alert.alert('Gagal', (err as { message?: string }).message ?? 'Gagal setujui revisi');
            }
          },
        },
      ],
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <FilterTabs current={filter} onChange={setFilter} />
        <LoadingScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FilterTabs current={filter} onChange={setFilter} />
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const nama = item.user?.name ?? 'Mahasiswa tidak diketahui';
          const nim = item.user?.nim;
          const periode = item.periode?.periode;
          const tanggal = formatTanggal(item.tanggal ?? item.created_at);
          const isPembimbing = item.is_pembimbing;

          return (
            <View style={styles.card}>
              {/* Role badge — paling atas, biar dosen langsung tau perannya */}
              <View style={[styles.roleBadge, isPembimbing ? styles.roleBimbingan : styles.roleUji]}>
                <Text style={[styles.roleBadgeText, isPembimbing ? styles.roleBimbinganText : styles.roleUjiText]}>
                  {isPembimbing ? '👨‍🏫' : '🧑‍⚖️'}  {item.my_role_label}
                </Text>
              </View>

              {/* Header: nama mahasiswa + status */}
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <Text style={styles.mhsName} numberOfLines={1}>{nama}</Text>
                  {nim ? <Text style={styles.mhsNim}>NIM {nim}</Text> : null}
                </View>
                <StatusBadge status={item.status} />
              </View>

              {/* Meta info */}
              <View style={styles.metaRow}>
                {periode ? (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Periode</Text>
                    <Text style={styles.metaValue} numberOfLines={1}>{periode}</Text>
                  </View>
                ) : null}
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Tanggal</Text>
                  <Text style={styles.metaValue}>{tanggal}</Text>
                </View>
              </View>

              {/* Action buttons — sejajar: Setujui Revisi & Beri Nilai */}
              {(() => {
                const myRole = item.my_role as RevisiRole;
                const myRevisiDone = !!item[revisiFieldFor(myRole)];
                return (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, myRevisiDone ? styles.revisiDoneBtn : styles.revisiBtn]}
                      onPress={() => {
                        if (myRevisiDone) {
                          Alert.alert('Revisi Disetujui', 'Anda sudah menyetujui revisi mahasiswa ini.');
                          return;
                        }
                        handleSetujuiRevisi(item.id, myRole);
                      }}
                    >
                      <Text style={[styles.actionBtnText, myRevisiDone ? styles.revisiDoneBtnText : styles.revisiBtnText]}>
                        {myRevisiDone ? '✓  Revisi Disetujui' : '✍️  Setujui Revisi'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.nilaiBtn]}
                      onPress={() =>
                        navigation.navigate('PenilaianForm', {
                          type: 'sempro',
                          targetId: item.id,
                          mahasiswaName: nama,
                        })
                      }
                    >
                      <Text style={styles.nilaiBtnText}>📝  Beri Nilai</Text>
                    </TouchableOpacity>
                  </View>
                );
              })()}
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            message={
              filter === 'bimbingan' ? 'Belum ada mahasiswa bimbingan sempro'
                : filter === 'uji' ? 'Belum ada mahasiswa yang diuji'
                : 'Belum ada data sempro'
            }
          />
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={items.length === 0 ? { flex: 1 } : { padding: 16 }}
      />
    </View>
  );
}

function FilterTabs({ current, onChange }: { current: PenilaianListType; onChange: (t: PenilaianListType) => void }) {
  return (
    <View style={styles.tabBar}>
      {FILTER_TABS.map((t) => {
        const active = t.key === current;
        return (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, active && styles.tabActive]}
            onPress={() => onChange(t.key)}
          >
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF0',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
  },
  tabActive: { backgroundColor: '#0066CC' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#666' },
  tabTextActive: { color: '#fff' },

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

  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  roleBimbingan: { backgroundColor: '#E3F2FD' },
  roleUji: { backgroundColor: '#FFF3E0' },
  roleBadgeText: { fontSize: 11, fontWeight: '700' },
  roleBimbinganText: { color: '#1565C0' },
  roleUjiText: { color: '#E65100' },

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
    gap: 12,
  },
  metaItem: { flex: 1 },
  metaLabel: { fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' },
  metaValue: { fontSize: 13, color: '#333', marginTop: 2, fontWeight: '500' },

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionBtnText: { fontSize: 13, fontWeight: '700' },

  revisiBtn: { backgroundColor: '#FFF8E1', borderColor: '#FFB300' },
  revisiBtnText: { color: '#E65100' },
  revisiDoneBtn: { backgroundColor: '#E8F5E9', borderColor: '#A5D6A7' },
  revisiDoneBtnText: { color: '#2E7D32' },

  nilaiBtn: { backgroundColor: '#0066CC', borderColor: '#0066CC' },
  nilaiBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
