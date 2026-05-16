import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Card, Surface, Text } from 'react-native-paper';
import {
  Check,
  Clock,
  FileText,
  GraduationCap,
  Pencil,
  Tag,
} from 'lucide-react-native';
import { pengajuanTAApi } from '../../api/endpoints/pengajuanTA';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { palette } from '../../theme';
import type { PengajuanTA } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PengajuanTADetail'>;

export function PengajuanTADetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const [data, setData] = useState<PengajuanTA | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await pengajuanTAApi.getById(id);
        if (response.data.success) setData(response.data.data);
      } catch (err: unknown) {
        setError((err as { message?: string }).message ?? 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (error || !data) return <ErrorMessage message={error ?? 'Data tidak ditemukan'} />;

  const canEdit = data.status === 'pending' || data.status === 'revision';

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Status hero */}
        <Surface elevation={0} style={styles.hero}>
          <View style={styles.heroTop}>
            <Text variant="labelSmall" style={styles.heroLabel}>
              PENGAJUAN TUGAS AKHIR
            </Text>
            <StatusBadge status={data.status} />
          </View>
          <Text variant="titleLarge" style={styles.heroTitle}>
            {data.judul}
          </Text>
          <View style={styles.heroBidang}>
            <Tag size={14} color="#fff" strokeWidth={2} />
            <Text variant="bodySmall" style={styles.heroBidangText}>
              {data.bidang_penelitian}
            </Text>
          </View>
        </Surface>

        {/* Pembimbing */}
        <Card mode="elevated" style={styles.card}>
          <Card.Content>
            <View style={styles.sectionLabel}>
              <GraduationCap size={16} color={palette.primary} strokeWidth={2} />
              <Text variant="labelLarge" style={styles.sectionLabelText}>
                Dosen Pembimbing
              </Text>
            </View>
            {data.pembimbing_1?.name && (
              <PembimbingRow
                order="1"
                name={data.pembimbing_1.name}
                approved={!!data.approve_pembimbing1}
              />
            )}
            {data.pembimbing_2?.name && (
              <PembimbingRow
                order="2"
                name={data.pembimbing_2.name}
                approved={!!data.approve_pembimbing2}
              />
            )}
            {!data.pembimbing_1?.name && !data.pembimbing_2?.name && (
              <Text variant="bodySmall" style={styles.emptyText}>
                Belum ada pembimbing ditetapkan
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Judul detail */}
        <Card mode="elevated" style={styles.card}>
          <Card.Content>
            <View style={styles.sectionLabel}>
              <FileText size={16} color={palette.primary} strokeWidth={2} />
              <Text variant="labelLarge" style={styles.sectionLabelText}>
                Detail Pengajuan
              </Text>
            </View>
            <DetailRow label="Judul" value={data.judul} />
            <DetailRow label="Bidang Penelitian" value={data.bidang_penelitian} />
            <DetailRow
              label="Tanggal Pengajuan"
              value={new Date(data.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            />
          </Card.Content>
        </Card>
      </ScrollView>

      {canEdit && (
        <Surface elevation={3} style={styles.actionBar}>
          <Button
            mode="contained"
            icon={({ size, color }) => <Pencil size={size} color={color} strokeWidth={2} />}
            onPress={() => navigation.navigate('PengajuanTAForm', { id: data.id, data })}
            contentStyle={styles.actionContent}
            style={styles.actionBtn}
          >
            Edit Pengajuan
          </Button>
        </Surface>
      )}
    </View>
  );
}

function PembimbingRow({
  order,
  name,
  approved,
}: {
  order: string;
  name: string;
  approved: boolean;
}) {
  return (
    <View style={styles.pembimbingRow}>
      <Surface elevation={0} style={styles.pembimbingOrderBadge}>
        <Text variant="labelMedium" style={styles.pembimbingOrderText}>
          P{order}
        </Text>
      </Surface>
      <View style={{ flex: 1 }}>
        <Text variant="titleSmall" style={styles.pembimbingName} numberOfLines={2}>
          {name}
        </Text>
        <View style={styles.pembimbingStatus}>
          {approved ? (
            <>
              <Check size={12} color={palette.success} strokeWidth={2.4} />
              <Text variant="labelSmall" style={[styles.statusText, { color: palette.success }]}>
                Sudah menyetujui
              </Text>
            </>
          ) : (
            <>
              <Clock size={12} color={palette.warning} strokeWidth={2.4} />
              <Text variant="labelSmall" style={[styles.statusText, { color: palette.warning }]}>
                Menunggu approval
              </Text>
            </>
          )}
        </View>
      </View>
      {approved ? (
        <Surface elevation={0} style={[styles.statusIcon, { backgroundColor: palette.successContainer }]}>
          <Check size={16} color={palette.success} strokeWidth={2.4} />
        </Surface>
      ) : (
        <Surface elevation={0} style={[styles.statusIcon, { backgroundColor: palette.warningContainer }]}>
          <Clock size={16} color={palette.warning} strokeWidth={2.4} />
        </Surface>
      )}
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text variant="labelSmall" style={styles.detailLabel}>
        {label}
      </Text>
      <Text variant="bodyMedium" style={styles.detailValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  hero: {
    backgroundColor: palette.primary,
    padding: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  heroTitle: { color: '#fff', fontWeight: '700', lineHeight: 28 },
  heroBidang: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  heroBidangText: { color: '#fff', fontWeight: '600' },

  card: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#fff',
  },
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionLabelText: { color: palette.onSurface, fontWeight: '700' },
  emptyText: { color: palette.onSurfaceVariant, fontStyle: 'italic' },

  pembimbingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  pembimbingOrderBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: palette.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pembimbingOrderText: { color: palette.primary, fontWeight: '800' },
  pembimbingName: { color: palette.onSurface, fontWeight: '600' },
  pembimbingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusText: { fontWeight: '600' },
  statusIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: palette.outlineVariant,
  },
  detailLabel: {
    color: palette.onSurfaceVariant,
    letterSpacing: 0.4,
    fontWeight: '600',
  },
  detailValue: { color: palette.onSurface, marginTop: 4, lineHeight: 22 },

  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: palette.outlineVariant,
  },
  actionBtn: { borderRadius: 12 },
  actionContent: { paddingVertical: 6 },
});
