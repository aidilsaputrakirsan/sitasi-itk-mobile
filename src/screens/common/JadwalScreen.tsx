import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { jadwalApi } from '../../api/endpoints/jadwal';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';

// Field nyata dari API /jadwal/my-schedule (JadwalSemproResource & JadwalTAResource)
interface RawJadwalSempro {
  id: number;
  tanggal_sempro?: string;
  waktu_mulai?: string;
  waktu_selesai?: string;
  ruangan?: string;
  user?: { id: number; name?: string; nim?: string };
  periode?: { periode?: string; gelombang?: string };
  penguji_1?: { id: number; name?: string } | null;
  penguji_2?: { id: number; name?: string } | null;
}

interface RawJadwalSidang {
  id: number;
  tanggal_sidang?: string;
  waktu_mulai?: string;
  waktu_selesai?: string;
  ruangan?: string;
  user?: { id: number; name?: string; nim?: string };
  periode?: { periode?: string; gelombang?: string };
}

// Response dari my-schedule: { jadwal_sempro, jadwal_sidang }
interface MyScheduleResponse {
  jadwal_sempro: RawJadwalSempro | RawJadwalSempro[] | null;
  jadwal_sidang: RawJadwalSidang | null;
}

function formatTanggal(tanggal?: string): string {
  if (!tanggal) return '-';
  const d = new Date(tanggal);
  if (isNaN(d.getTime())) return tanggal;
  return d.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function JadwalCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function SemproCard({ jadwal }: { jadwal: RawJadwalSempro }) {
  const periodeLabel = jadwal.periode?.periode
    ? `${jadwal.periode.periode}${jadwal.periode.gelombang ? ` · Gel. ${jadwal.periode.gelombang}` : ''}`
    : undefined;

  return (
    <JadwalCard>
      <Text style={styles.cardDate}>{formatTanggal(jadwal.tanggal_sempro)}</Text>
      {jadwal.waktu_mulai && jadwal.waktu_selesai && (
        <Text style={styles.cardTime}>{jadwal.waktu_mulai} – {jadwal.waktu_selesai}</Text>
      )}
      {jadwal.ruangan && <Text style={styles.cardInfo}>Ruangan: {jadwal.ruangan}</Text>}
      {periodeLabel && <Text style={styles.cardInfo}>Periode: {periodeLabel}</Text>}
      {jadwal.penguji_1?.name && <Text style={styles.cardInfo}>Penguji 1: {jadwal.penguji_1.name}</Text>}
      {jadwal.penguji_2?.name && <Text style={styles.cardInfo}>Penguji 2: {jadwal.penguji_2.name}</Text>}
      {jadwal.user?.name && <Text style={styles.cardInfo}>Mahasiswa: {jadwal.user.name}</Text>}
    </JadwalCard>
  );
}

function SidangCard({ jadwal }: { jadwal: RawJadwalSidang }) {
  const periodeLabel = jadwal.periode?.periode
    ? `${jadwal.periode.periode}${jadwal.periode.gelombang ? ` · Gel. ${jadwal.periode.gelombang}` : ''}`
    : undefined;

  return (
    <JadwalCard>
      <Text style={styles.cardDate}>{formatTanggal(jadwal.tanggal_sidang)}</Text>
      {jadwal.waktu_mulai && jadwal.waktu_selesai && (
        <Text style={styles.cardTime}>{jadwal.waktu_mulai} – {jadwal.waktu_selesai}</Text>
      )}
      {jadwal.ruangan && <Text style={styles.cardInfo}>Ruangan: {jadwal.ruangan}</Text>}
      {periodeLabel && <Text style={styles.cardInfo}>Periode: {periodeLabel}</Text>}
    </JadwalCard>
  );
}

export function JadwalScreen() {
  const [data, setData] = useState<MyScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await jadwalApi.mySchedule();
      if (response.data.success) {
        setData(response.data.data as unknown as MyScheduleResponse);
      }
    } catch { /* silent */ } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  if (loading) return <LoadingScreen />;

  // Normalise jadwal_sempro: bisa single object atau array (untuk dosen)
  const semproList: RawJadwalSempro[] = data?.jadwal_sempro
    ? (Array.isArray(data.jadwal_sempro) ? data.jadwal_sempro : [data.jadwal_sempro])
    : [];

  const sidangItem = data?.jadwal_sidang ?? null;
  const hasData = semproList.length > 0 || !!sidangItem;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={!hasData ? { flex: 1 } : undefined}
    >
      {!hasData && <EmptyState message="Belum ada jadwal" />}

      {semproList.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Jadwal Seminar Proposal</Text>
          {semproList.map((j) => <SemproCard key={j.id} jadwal={j} />)}
        </View>
      )}

      {sidangItem && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Jadwal Sidang TA</Text>
          <SidangCard jadwal={sidangItem} />
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  section: { margin: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#0066CC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDate: { fontSize: 14, fontWeight: '600', color: '#333' },
  cardTime: { fontSize: 13, color: '#0066CC', marginTop: 4 },
  cardInfo: { fontSize: 13, color: '#555', marginTop: 4 },
});
