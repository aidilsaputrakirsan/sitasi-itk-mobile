import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  RefreshControl,
} from 'react-native';
import { jadwalApi } from '../../api/endpoints/jadwal';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';

// Field asli dari JadwalSemproResource
interface RawJadwalSempro {
  id: number;
  tanggal_sempro?: string;   // bukan "tanggal"
  waktu_mulai?: string;
  waktu_selesai?: string;
  ruangan?: string;
  user?: { id: number; name?: string; nim?: string };        // mahasiswa
  periode?: { id: number; periode?: string; semester?: string; gelombang?: string };
  penguji_1?: { id: number; name?: string } | null;
  penguji_2?: { id: number; name?: string } | null;
}

// Field asli dari JadwalTAResource
interface RawJadwalSidang {
  id: number;
  tanggal_sidang?: string;   // bukan "tanggal"
  waktu_mulai?: string;
  waktu_selesai?: string;
  ruangan?: string;
  user?: { id: number; name?: string; nim?: string };
  periode?: { id: number; periode?: string; semester?: string; gelombang?: string };
}

interface Section {
  title: string;
  data: (RawJadwalSempro | RawJadwalSidang)[];
  type: 'sempro' | 'sidang';
}

function formatTanggal(tanggal?: string): string {
  if (!tanggal) return '-';
  const d = new Date(tanggal);
  if (isNaN(d.getTime())) return tanggal; // kalau bukan ISO, tampilkan apa adanya
  return d.toLocaleDateString('id-ID', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function JadwalAdminScreen() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [semproRes, sidangRes] = await Promise.all([
        jadwalApi.listSempro({ per_page: 50 }),
        jadwalApi.listSidang({ per_page: 50 }),
      ]);

      const result: Section[] = [];

      if (semproRes.data.success && semproRes.data.data.length > 0) {
        result.push({
          title: 'Jadwal Sempro',
          type: 'sempro',
          data: semproRes.data.data as unknown as RawJadwalSempro[],
        });
      }
      if (sidangRes.data.success && sidangRes.data.data.length > 0) {
        result.push({
          title: 'Jadwal Sidang',
          type: 'sidang',
          data: sidangRes.data.data as unknown as RawJadwalSidang[],
        });
      }

      setSections(result);
    } catch { /* silent */ } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  if (loading) return <LoadingScreen />;

  return (
    <SectionList
      style={styles.container}
      sections={sections}
      keyExtractor={(item) => String(item.id)}
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionHeader}>{section.title}</Text>
      )}
      renderItem={({ item, section }) => {
        const isSempro = (section as Section).type === 'sempro';

        const tanggal = isSempro
          ? formatTanggal((item as RawJadwalSempro).tanggal_sempro)
          : formatTanggal((item as RawJadwalSidang).tanggal_sidang);

        const mahasiswaName = item.user?.name ?? '-';
        const mahasiswaNim = item.user?.nim;

        const periodeLabel = item.periode?.periode
          ? `${item.periode.periode}${item.periode.gelombang ? ` · Gel. ${item.periode.gelombang}` : ''}`
          : undefined;

        return (
          <View style={styles.card}>
            <Text style={styles.cardDate}>{tanggal}</Text>
            {item.waktu_mulai && item.waktu_selesai && (
              <Text style={styles.cardTime}>{item.waktu_mulai} – {item.waktu_selesai}</Text>
            )}
            <Text style={styles.cardMhs}>
              {mahasiswaName}
              {mahasiswaNim ? ` (${mahasiswaNim})` : ''}
            </Text>
            {item.ruangan && <Text style={styles.cardInfo}>Ruangan: {item.ruangan}</Text>}
            {periodeLabel && <Text style={styles.cardInfo}>Periode: {periodeLabel}</Text>}
            {isSempro && (item as RawJadwalSempro).penguji_1?.name && (
              <Text style={styles.cardInfo}>Penguji 1: {(item as RawJadwalSempro).penguji_1?.name}</Text>
            )}
            {isSempro && (item as RawJadwalSempro).penguji_2?.name && (
              <Text style={styles.cardInfo}>Penguji 2: {(item as RawJadwalSempro).penguji_2?.name}</Text>
            )}
          </View>
        );
      }}
      ListEmptyComponent={<EmptyState message="Belum ada jadwal" />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={sections.length === 0 ? { flex: 1 } : { paddingBottom: 16 }}
      stickySectionHeadersEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#0066CC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDate: { fontSize: 14, fontWeight: '600', color: '#333' },
  cardTime: { fontSize: 13, color: '#0066CC', marginTop: 2 },
  cardMhs: { fontSize: 14, fontWeight: '500', color: '#444', marginTop: 6 },
  cardInfo: { fontSize: 13, color: '#666', marginTop: 3 },
});
