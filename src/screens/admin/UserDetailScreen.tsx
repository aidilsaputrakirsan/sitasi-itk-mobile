import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { usersApi } from '../../api/endpoints/users';
import { useAuthStore } from '../../stores/authStore';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'UserDetail'>;

interface RawUser {
  id: number;
  name: string;
  username?: string;
  email: string;
  nim?: string;
  telpon?: string;
  judul_ta?: string;
  roles?: Array<string | { name: string }>;
  mahasiswa?: { id: number; nama?: string; nim?: string; nomor_telepon?: string } | null;
  dosen?: { id: number; nama_dosen?: string; nip?: string; prodi?: string; asal_instansi?: string; jabatan_akademik?: string; is_eksternal?: boolean } | null;
  created_at?: string;
}

function extractRoleNames(roles?: Array<string | { name: string }>): string[] {
  return (roles ?? []).map((r) => (typeof r === 'string' ? r : r?.name ?? '')).filter(Boolean);
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function UserDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const currentUser = useAuthStore((s) => s.user);
  const isKoorpro = useAuthStore((s) => s.hasRole)('koorpro');

  const [data, setData] = useState<RawUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const response = await usersApi.getById(id);
        if (response.data.success) {
          setData(response.data.data as unknown as RawUser);
        }
      } catch (err: unknown) {
        setError((err as { message?: string }).message ?? 'Gagal memuat data user');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = () => {
    if (!data) return;
    if (data.id === currentUser?.id) {
      Alert.alert('Gagal', 'Tidak dapat menghapus akun sendiri');
      return;
    }
    Alert.alert('Hapus User', `Hapus user "${data.name}"? Tindakan ini tidak dapat dibatalkan.`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await usersApi.delete(id);
            Alert.alert('Berhasil', 'User berhasil dihapus');
            navigation.goBack();
          } catch (err: unknown) {
            Alert.alert('Gagal', (err as { message?: string }).message ?? 'Gagal menghapus user');
          }
        },
      },
    ]);
  };

  const handleResetData = () => {
    if (!data) return;
    Alert.alert(
      'Reset Data Mahasiswa',
      `Reset semua progress TA "${data.name}"? Data bimbingan, pengajuan, sempro, dan sidang akan dihapus. Akun tetap ada.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setResetting(true);
            try {
              await usersApi.resetData(id);
              Alert.alert('Berhasil', 'Data progress mahasiswa berhasil direset');
            } catch (err: unknown) {
              Alert.alert('Gagal', (err as { message?: string }).message ?? 'Gagal mereset data');
            } finally {
              setResetting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingScreen />;
  if (error || !data) return <ErrorMessage message={error ?? 'Data tidak ditemukan'} />;

  const roleNames = extractRoleNames(data.roles);
  const isMahasiswa = roleNames.includes('mahasiswa');
  const nim = data.nim ?? data.mahasiswa?.nim;
  const nip = data.dosen?.nip;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{data.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{data.name}</Text>
        <View style={styles.rolesRow}>
          {roleNames.map((r) => (
            <View key={r} style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{r}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Info umum */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informasi Akun</Text>
        <InfoRow label="Username" value={data.username} />
        <InfoRow label="Email" value={data.email} />
        <InfoRow label="Telepon" value={data.telpon} />
        {nim && <InfoRow label="NIM" value={nim} />}
        {nip && <InfoRow label="NIP" value={nip} />}
        {data.judul_ta && <InfoRow label="Judul TA" value={data.judul_ta} />}
        {data.created_at && (
          <InfoRow
            label="Bergabung"
            value={new Date(data.created_at).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          />
        )}
      </View>

      {/* Info dosen */}
      {data.dosen && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Dosen</Text>
          <InfoRow label="Nama Dosen" value={data.dosen.nama_dosen} />
          <InfoRow label="NIP" value={data.dosen.nip} />
          <InfoRow label="Prodi" value={data.dosen.prodi} />
          <InfoRow label="Instansi" value={data.dosen.asal_instansi} />
          <InfoRow label="Jabatan" value={data.dosen.jabatan_akademik} />
          {data.dosen.is_eksternal !== undefined && (
            <InfoRow label="Status" value={data.dosen.is_eksternal ? 'Dosen Eksternal' : 'Dosen Internal'} />
          )}
        </View>
      )}

      {/* Info mahasiswa */}
      {data.mahasiswa && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Mahasiswa</Text>
          <InfoRow label="Nama" value={data.mahasiswa.nama} />
          <InfoRow label="NIM" value={data.mahasiswa.nim} />
          <InfoRow label="Telepon" value={data.mahasiswa.nomor_telepon} />
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Hapus User</Text>
        </TouchableOpacity>

        {isMahasiswa && isKoorpro && (
          <TouchableOpacity
            style={[styles.resetButton, resetting && { opacity: 0.6 }]}
            onPress={handleResetData}
            disabled={resetting}
          >
            {resetting
              ? <ActivityIndicator color="#E65100" />
              : <Text style={styles.resetButtonText}>Reset Data Progress TA</Text>
            }
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: '#333' },
  rolesRow: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' },
  roleBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  roleBadgeText: { fontSize: 12, color: '#1565C0', fontWeight: '600', textTransform: 'capitalize' },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  rowLabel: { fontSize: 14, color: '#666' },
  rowValue: { fontSize: 14, fontWeight: '500', color: '#333', flexShrink: 1, textAlign: 'right', marginLeft: 12 },
  actions: { margin: 16, gap: 10 },
  deleteButton: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  deleteButtonText: { color: '#C62828', fontSize: 15, fontWeight: '600' },
  resetButton: {
    backgroundColor: '#FFF3E0',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  resetButtonText: { color: '#E65100', fontSize: 15, fontWeight: '600' },
});
