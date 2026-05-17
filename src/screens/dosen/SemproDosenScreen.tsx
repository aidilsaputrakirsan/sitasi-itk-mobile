import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Button,
  Card,
  Chip,
  Dialog,
  Portal,
  Snackbar,
  Surface,
  Text,
} from 'react-native-paper';
import {
  BookOpenCheck,
  Calendar,
  Check,
  ClipboardCheck,
  ClipboardEdit,
  Presentation,
} from 'lucide-react-native';
import { semproApi } from '../../api/endpoints/sempro';
import { penilaianApi } from '../../api/endpoints/penilaian';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import { palette } from '../../theme';
import type { PenilaianListItemSempro, PenilaianListType } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

type RevisiRole = 'pembimbing_1' | 'pembimbing_2' | 'penguji_1' | 'penguji_2';

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
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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

  // Confirm dialog state — dipakai untuk 2 mode: revisi atau approve-pendaftaran
  const [confirmItem, setConfirmItem] = useState<PenilaianListItemSempro | null>(null);
  const [confirmMode, setConfirmMode] = useState<'revisi' | 'approve'>('revisi');
  const [submittingRevisi, setSubmittingRevisi] = useState(false);
  const [snack, setSnack] = useState<{ visible: boolean; message: string; variant: 'success' | 'error' }>({
    visible: false,
    message: '',
    variant: 'success',
  });

  const showSnack = (message: string, variant: 'success' | 'error') =>
    setSnack({ visible: true, message, variant });

  const fetchData = useCallback(async (type: PenilaianListType) => {
    try {
      const response = await penilaianApi.listSempro(type);
      if (response.data.success) {
        setItems(response.data.data);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchData(filter);
  }, [fetchData, filter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(filter);
  };

  const submitConfirm = async () => {
    if (!confirmItem) return;
    const role = confirmItem.my_role as RevisiRole;
    setSubmittingRevisi(true);
    try {
      if (confirmMode === 'approve') {
        // Hanya pembimbing yang bisa approve pendaftaran sempro
        await semproApi.approve(confirmItem.id, { role });
        showSnack('Pendaftaran sempro berhasil disetujui', 'success');
      } else {
        await semproApi.submitRevisi(confirmItem.id, { role, status: true });
        showSnack('Revisi berhasil disetujui', 'success');
      }
      setConfirmItem(null);
      fetchData(filter);
    } catch (err: unknown) {
      showSnack((err as { message?: string }).message ?? 'Gagal memproses', 'error');
    } finally {
      setSubmittingRevisi(false);
    }
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
        renderItem={({ item }) => (
          <SemproCard
            item={item}
            onApprove={() => {
              setConfirmMode('approve');
              setConfirmItem(item);
            }}
            onSetujuiRevisi={() => {
              setConfirmMode('revisi');
              setConfirmItem(item);
            }}
            onBeriNilai={() =>
              navigation.navigate('PenilaianForm', {
                type: 'sempro',
                targetId: item.id,
                mahasiswaName: item.user?.name ?? 'Mahasiswa',
              })
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            message={
              filter === 'bimbingan'
                ? 'Belum ada mahasiswa bimbingan sempro'
                : filter === 'uji'
                ? 'Belum ada mahasiswa yang diuji'
                : 'Belum ada data sempro'
            }
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[palette.primary]} />
        }
        contentContainerStyle={items.length === 0 ? styles.emptyContent : styles.listContent}
      />

      {/* Confirm dialog: revisi atau approve-pendaftaran */}
      <Portal>
        <Dialog visible={!!confirmItem} onDismiss={() => !submittingRevisi && setConfirmItem(null)}>
          <Dialog.Title style={styles.dialogTitle}>
            {confirmMode === 'approve' ? 'Setujui Pendaftaran Sempro' : 'Setujui Revisi Sempro'}
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogText}>
              {confirmMode === 'approve'
                ? 'Anda akan menyetujui pendaftaran seminar proposal mahasiswa '
                : 'Anda akan menyetujui hasil revisi seminar proposal mahasiswa '}
              <Text style={{ fontWeight: '700' }}>
                {confirmItem?.user?.name ?? '-'}
              </Text>
              {' sebagai '}
              <Text style={{ fontWeight: '700' }}>
                {confirmItem?.my_role_label}
              </Text>
              {'. Tindakan ini tidak dapat dibatalkan.'}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmItem(null)} disabled={submittingRevisi}>
              Batal
            </Button>
            <Button
              mode="contained"
              onPress={submitConfirm}
              loading={submittingRevisi}
              disabled={submittingRevisi}
              buttonColor={palette.success}
            >
              {confirmMode === 'approve' ? 'Setujui Pendaftaran' : 'Setujui Revisi'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snack.visible}
        onDismiss={() => setSnack((s) => ({ ...s, visible: false }))}
        duration={2500}
        style={{ backgroundColor: snack.variant === 'success' ? palette.success : palette.error }}
      >
        {snack.message}
      </Snackbar>
    </View>
  );
}

function SemproCard({
  item,
  onApprove,
  onSetujuiRevisi,
  onBeriNilai,
}: {
  item: PenilaianListItemSempro;
  onApprove: () => void;
  onSetujuiRevisi: () => void;
  onBeriNilai: () => void;
}) {
  const nama = item.user?.name ?? 'Mahasiswa tidak diketahui';
  const nim = item.user?.nim;
  const periode = item.periode?.periode;
  const tanggal = formatTanggal(item.tanggal ?? item.created_at);
  const isPembimbing = item.is_pembimbing;
  const myRole = item.my_role as RevisiRole;
  const myRevisiDone = !!item[revisiFieldFor(myRole)];
  const initial = nama.split(/\s+/).slice(0, 2).map((s) => s.charAt(0).toUpperCase()).join('') || 'M';

  // Approve persetujuan sempro (hanya untuk pembimbing yang belum approve).
  const myApprove = isPembimbing
    ? (myRole === 'pembimbing_1'
        ? item.approve_pembimbing_1
        : item.approve_pembimbing_2)
    : null;
  const needsApprove = isPembimbing && !myApprove;

  return (
    <Card mode="elevated" style={styles.card}>
      <Card.Content style={{ paddingVertical: 14 }}>
        {/* Role badge */}
        <View style={styles.roleRow}>
          <Chip
            compact
            icon={() =>
              isPembimbing ? (
                <BookOpenCheck size={12} color={palette.primary} strokeWidth={2.4} />
              ) : (
                <ClipboardEdit size={12} color={palette.tertiary} strokeWidth={2.4} />
              )
            }
            style={[styles.roleChip, isPembimbing ? styles.roleChipBimbingan : styles.roleChipUji]}
            textStyle={[
              styles.roleChipText,
              isPembimbing ? styles.roleChipTextBimbingan : styles.roleChipTextUji,
            ]}
            showSelectedCheck={false}
          >
            {item.my_role_label}
          </Chip>
        </View>

        {/* Header: avatar + nama + status */}
        <View style={styles.cardHeader}>
          <Surface elevation={0} style={styles.avatar}>
            <Text variant="titleMedium" style={styles.avatarText}>
              {initial}
            </Text>
          </Surface>
          <View style={{ flex: 1 }}>
            <Text variant="titleSmall" style={styles.mhsName} numberOfLines={1}>
              {nama}
            </Text>
            {nim && (
              <Text variant="labelSmall" style={styles.mhsNim}>
                NIM {nim}
              </Text>
            )}
          </View>
          <StatusBadge status={item.status} />
        </View>

        {/* Meta */}
        <View style={styles.metaRow}>
          {periode && (
            <View style={styles.metaItem}>
              <Text variant="labelSmall" style={styles.metaLabel}>
                PERIODE
              </Text>
              <Text variant="bodySmall" style={styles.metaValue} numberOfLines={1}>
                {periode}
              </Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <View style={styles.metaRowInner}>
              <Calendar size={12} color={palette.onSurfaceVariant} strokeWidth={2} />
              <Text variant="labelSmall" style={styles.metaLabel}>
                TANGGAL
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.metaValue}>
              {tanggal}
            </Text>
          </View>
        </View>

        {/* Actions — conditional berdasarkan tahap workflow */}
        {needsApprove ? (
          <View>
            <Surface elevation={0} style={styles.notice}>
              <Text variant="bodySmall" style={styles.noticeText}>
                Mahasiswa menunggu persetujuan Anda sebelum sempro dapat dilaksanakan.
              </Text>
            </Surface>
            <Button
              mode="contained"
              onPress={onApprove}
              icon={({ size, color }) => <Check size={size} color={color} strokeWidth={2.4} />}
              buttonColor={palette.tertiary}
              contentStyle={styles.actionContent}
              style={styles.fullActionBtn}
            >
              Setujui Pendaftaran Sempro
            </Button>
          </View>
        ) : (
          <View style={styles.actionRow}>
            <Button
              mode={myRevisiDone ? 'contained-tonal' : 'outlined'}
              onPress={() => {
                if (myRevisiDone) return;
                onSetujuiRevisi();
              }}
              disabled={myRevisiDone}
              icon={({ size, color }) =>
                myRevisiDone ? (
                  <Check size={size} color={color} strokeWidth={2.4} />
                ) : (
                  <ClipboardCheck size={size} color={color} strokeWidth={2} />
                )
              }
              buttonColor={myRevisiDone ? palette.successContainer : undefined}
              textColor={myRevisiDone ? palette.success : palette.warning}
              style={[styles.actionBtn, { borderColor: palette.warningContainer }]}
              contentStyle={styles.actionContent}
              compact
            >
              {myRevisiDone ? 'Revisi Disetujui' : 'Setujui Revisi'}
            </Button>
            <Button
              mode="contained"
              onPress={onBeriNilai}
              icon={({ size, color }) => <Presentation size={size} color={color} strokeWidth={2} />}
              style={styles.actionBtn}
              contentStyle={styles.actionContent}
              compact
            >
              Beri Nilai
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

function FilterTabs({
  current,
  onChange,
}: {
  current: PenilaianListType;
  onChange: (t: PenilaianListType) => void;
}) {
  return (
    <View style={styles.filterRow}>
      {FILTER_TABS.map((t) => (
        <Chip
          key={t.key}
          selected={t.key === current}
          onPress={() => onChange(t.key)}
          style={[styles.filterChip, t.key === current && styles.filterChipActive]}
          textStyle={[styles.filterText, t.key === current && styles.filterTextActive]}
          showSelectedCheck={false}
          compact
        >
          {t.label}
        </Chip>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: palette.outlineVariant,
  },
  filterChip: { backgroundColor: '#fff', borderColor: palette.outline, flex: 1 },
  filterChipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
  filterText: { color: palette.onSurfaceVariant, fontSize: 12, textAlign: 'center' },
  filterTextActive: { color: '#fff', fontWeight: '700' },

  listContent: { padding: 16, paddingBottom: 24 },
  emptyContent: { flex: 1, justifyContent: 'center' },

  card: { marginBottom: 10, backgroundColor: '#fff', borderRadius: 12 },

  roleRow: { flexDirection: 'row', marginBottom: 10 },
  roleChip: { height: 28, alignSelf: 'flex-start' },
  roleChipBimbingan: { backgroundColor: palette.primaryContainer },
  roleChipUji: { backgroundColor: palette.tertiaryContainer },
  roleChipText: { fontSize: 11, fontWeight: '700' },
  roleChipTextBimbingan: { color: palette.primary },
  roleChipTextUji: { color: '#78350f' },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800' },
  mhsName: { color: palette.onSurface, fontWeight: '700' },
  mhsNim: { color: palette.onSurfaceVariant, marginTop: 2 },

  metaRow: {
    flexDirection: 'row',
    backgroundColor: palette.surfaceVariant,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 12,
  },
  metaItem: { flex: 1 },
  metaRowInner: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaLabel: { color: palette.onSurfaceVariant, letterSpacing: 0.6, fontWeight: '700' },
  metaValue: { color: palette.onSurface, fontWeight: '600', marginTop: 2 },

  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, borderRadius: 10 },
  fullActionBtn: { borderRadius: 10 },
  actionContent: { paddingVertical: 4 },
  notice: {
    backgroundColor: palette.tertiaryContainer,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  noticeText: { color: '#78350f', lineHeight: 19 },

  dialogTitle: { color: palette.onSurface, fontWeight: '700' },
  dialogText: { color: palette.onSurface, lineHeight: 22 },
});
