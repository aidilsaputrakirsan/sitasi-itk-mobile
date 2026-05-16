import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Dialog,
  HelperText,
  Portal,
  Snackbar,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import {
  Check,
  FileText,
  IdCard,
  Tag,
  UserRound,
  X,
} from 'lucide-react-native';
import { pengajuanTAApi } from '../../api/endpoints/pengajuanTA';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import { palette } from '../../theme';
import { useAuthStore } from '../../stores/authStore';
import type { PengajuanTA, PaginationMeta, PengajuanTAStatus } from '../../types';

interface FilterOption {
  value: PengajuanTAStatus | undefined;
  label: string;
}

const filters: FilterOption[] = [
  { value: undefined, label: 'Semua' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
];

type ReviewMode = 'approve' | 'reject';

export function PengajuanDosenScreen() {
  const currentUser = useAuthStore((s) => s.user);
  const [items, setItems] = useState<PengajuanTA[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<PengajuanTAStatus | undefined>(undefined);

  const [reviewItem, setReviewItem] = useState<PengajuanTA | null>(null);
  const [reviewMode, setReviewMode] = useState<ReviewMode>('approve');
  const [keterangan, setKeterangan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState<{
    visible: boolean;
    message: string;
    variant: 'success' | 'error';
  }>({ visible: false, message: '', variant: 'success' });

  const showSnack = (message: string, variant: 'success' | 'error') =>
    setSnack({ visible: true, message, variant });

  const fetchData = useCallback(
    async (page = 1, append = false) => {
      try {
        const response = await pengajuanTAApi.list({ page, per_page: 15 });
        if (response.data.success) {
          const filtered = filter
            ? response.data.data.filter((p) => p.status === filter)
            : response.data.data;
          if (append) {
            setItems((prev) => [...prev, ...filtered]);
          } else {
            setItems(filtered);
          }
          setMeta(response.data.meta);
        }
      } catch {
        /* silent */
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [filter]
  );

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(1);
  };

  const onEndReached = () => {
    if (!meta || meta.current_page >= meta.last_page || loadingMore) return;
    setLoadingMore(true);
    fetchData(meta.current_page + 1, true);
  };

  const openReview = (item: PengajuanTA, mode: ReviewMode) => {
    setReviewItem(item);
    setReviewMode(mode);
    setKeterangan('');
  };

  const closeReview = () => {
    if (submitting) return;
    setReviewItem(null);
    setKeterangan('');
  };

  const submitReview = async () => {
    if (!reviewItem) return;
    if (reviewMode === 'reject' && !keterangan.trim()) {
      showSnack('Alasan penolakan harus diisi', 'error');
      return;
    }
    setSubmitting(true);
    try {
      if (reviewMode === 'approve') {
        await pengajuanTAApi.approve(reviewItem.id);
        showSnack('Pengajuan disetujui', 'success');
      } else {
        await pengajuanTAApi.reject(reviewItem.id, { keterangan });
        showSnack('Pengajuan ditolak', 'success');
      }
      setReviewItem(null);
      setKeterangan('');
      fetchData(1);
    } catch (err: unknown) {
      showSnack((err as { message?: string }).message ?? 'Gagal memproses', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !refreshing) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      {/* Filter chips */}
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <Chip
            key={f.value ?? 'all'}
            selected={filter === f.value}
            onPress={() => setFilter(f.value)}
            style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
            textStyle={[styles.filterText, filter === f.value && styles.filterTextActive]}
            showSelectedCheck={false}
            compact
          >
            {f.label}
          </Chip>
        ))}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PengajuanDosenCard
            item={item}
            currentUserId={currentUser?.id}
            onReview={(mode) => openReview(item, mode)}
          />
        )}
        ListEmptyComponent={<EmptyState message="Belum ada pengajuan TA dari mahasiswa" />}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={{ marginVertical: 16 }} color={palette.primary} />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[palette.primary]}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        contentContainerStyle={
          items.length === 0 ? styles.emptyContent : styles.listContent
        }
      />

      {/* Review Dialog */}
      <Portal>
        <Dialog visible={!!reviewItem} onDismiss={closeReview} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>
            {reviewMode === 'approve' ? 'Setujui Pengajuan TA' : 'Tolak Pengajuan TA'}
          </Dialog.Title>
          <Dialog.Content>
            {reviewItem && (
              <>
                <Text variant="labelSmall" style={styles.dialogLabel}>
                  MAHASISWA
                </Text>
                <Text variant="bodyMedium" style={styles.dialogValue}>
                  {reviewItem.mahasiswa?.nama ?? '-'}
                  {reviewItem.mahasiswa?.nim ? ` · ${reviewItem.mahasiswa.nim}` : ''}
                </Text>

                <Text variant="labelSmall" style={[styles.dialogLabel, { marginTop: 12 }]}>
                  JUDUL TA
                </Text>
                <Text variant="bodyMedium" style={styles.dialogValue}>
                  {reviewItem.judul}
                </Text>

                <Text variant="labelSmall" style={[styles.dialogLabel, { marginTop: 12 }]}>
                  BIDANG PENELITIAN
                </Text>
                <Text variant="bodyMedium" style={styles.dialogValue}>
                  {reviewItem.bidang_penelitian}
                </Text>

                {reviewMode === 'reject' && (
                  <>
                    <Text variant="labelSmall" style={[styles.dialogLabel, { marginTop: 16 }]}>
                      ALASAN PENOLAKAN *
                    </Text>
                    <TextInput
                      mode="outlined"
                      value={keterangan}
                      onChangeText={setKeterangan}
                      placeholder="Tuliskan alasan penolakan..."
                      multiline
                      numberOfLines={3}
                      style={styles.dialogInput}
                    />
                    <HelperText type="info" visible>
                      Mahasiswa akan menerima alasan ini dan dapat memperbaiki pengajuan
                    </HelperText>
                  </>
                )}
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeReview} disabled={submitting}>
              Batal
            </Button>
            <Button
              mode="contained"
              onPress={submitReview}
              loading={submitting}
              disabled={submitting}
              buttonColor={reviewMode === 'approve' ? palette.success : palette.error}
            >
              {reviewMode === 'approve' ? 'Setujui' : 'Tolak'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snack.visible}
        onDismiss={() => setSnack((s) => ({ ...s, visible: false }))}
        duration={2500}
        style={{
          backgroundColor: snack.variant === 'success' ? palette.success : palette.error,
        }}
      >
        {snack.message}
      </Snackbar>
    </View>
  );
}

function PengajuanDosenCard({
  item,
  currentUserId,
  onReview,
}: {
  item: PengajuanTA;
  currentUserId?: number;
  onReview: (mode: ReviewMode) => void;
}) {
  const statusLower = String(item.status ?? '').toLowerCase();
  const isPending = statusLower === 'pending';
  const nama = item.mahasiswa?.nama ?? 'Mahasiswa tidak diketahui';
  const nim = item.mahasiswa?.nim;

  // Cek apakah current user sudah approve sebagai P1 atau P2
  const isP1 = currentUserId !== undefined && item.pembimbing_1_id === currentUserId;
  const isP2 = currentUserId !== undefined && item.pembimbing_2_id === currentUserId;
  const myRole = isP1 ? 'P1' : isP2 ? 'P2' : null;
  const meAlreadyApproved =
    (isP1 && !!item.approve_pembimbing1) || (isP2 && !!item.approve_pembimbing2);
  const canAct = isPending && myRole !== null && !meAlreadyApproved;

  return (
    <Card mode="elevated" style={styles.card}>
      <Card.Content style={{ paddingVertical: 14 }}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <Surface elevation={0} style={styles.bidangBadge}>
            <Tag size={12} color={palette.primary} strokeWidth={2.2} />
            <Text variant="labelSmall" style={styles.bidangText} numberOfLines={1}>
              {item.bidang_penelitian}
            </Text>
          </Surface>
          <StatusBadge status={item.status} />
        </View>

        {/* Judul */}
        <View style={styles.judulRow}>
          <FileText size={16} color={palette.onSurfaceVariant} strokeWidth={1.8} />
          <Text variant="titleSmall" style={styles.judul} numberOfLines={3}>
            {item.judul}
          </Text>
        </View>

        {/* Mahasiswa info */}
        <Surface elevation={0} style={styles.mhsBox}>
          <View style={styles.mhsRow}>
            <UserRound size={14} color={palette.primary} strokeWidth={2} />
            <Text variant="bodyMedium" style={styles.mhsName} numberOfLines={1}>
              {nama}
            </Text>
          </View>
          {nim && (
            <View style={styles.mhsRow}>
              <IdCard size={14} color={palette.onSurfaceVariant} strokeWidth={2} />
              <Text variant="bodySmall" style={styles.mhsMeta}>
                NIM {nim}
              </Text>
            </View>
          )}
        </Surface>

        {/* Indikator approval per pembimbing */}
        {myRole && (
          <View style={styles.approvalRow}>
            <Surface
              elevation={0}
              style={[
                styles.approvalBadge,
                isP1 && !!item.approve_pembimbing1 && styles.approvalBadgeDone,
                isP2 && !!item.approve_pembimbing2 && styles.approvalBadgeDone,
              ]}
            >
              {meAlreadyApproved ? (
                <Check size={12} color={palette.success} strokeWidth={2.4} />
              ) : (
                <Check size={12} color={palette.onSurfaceVariant} strokeWidth={2} />
              )}
              <Text
                variant="labelSmall"
                style={[
                  styles.approvalText,
                  meAlreadyApproved && styles.approvalTextDone,
                ]}
              >
                {meAlreadyApproved
                  ? `Anda sudah menyetujui sebagai ${myRole}`
                  : `Anda sebagai ${myRole}`}
              </Text>
            </Surface>
          </View>
        )}

        {/* Actions */}
        {canAct && (
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={() => onReview('approve')}
              icon={({ size, color }) => <Check size={size} color={color} strokeWidth={2.4} />}
              buttonColor={palette.success}
              style={[styles.actionBtn, { flex: 1 }]}
              contentStyle={styles.actionContent}
              compact
            >
              Setujui
            </Button>
            <Button
              mode="outlined"
              onPress={() => onReview('reject')}
              icon={({ size, color }) => <X size={size} color={color} strokeWidth={2.4} />}
              textColor={palette.error}
              style={[styles.actionBtn, styles.rejectBtn, { flex: 1 }]}
              contentStyle={styles.actionContent}
              compact
            >
              Tolak
            </Button>
          </View>
        )}

        {/* Info bila sudah approve oleh current user tapi belum semua */}
        {isPending && meAlreadyApproved && (
          <Surface elevation={0} style={styles.waitingBox}>
            <Text variant="bodySmall" style={styles.waitingText}>
              Menunggu approval pembimbing lain agar pengajuan disetujui penuh.
            </Text>
          </Surface>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: { backgroundColor: '#fff', borderColor: palette.outline },
  filterChipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
  filterText: { color: palette.onSurfaceVariant, fontSize: 12 },
  filterTextActive: { color: '#fff', fontWeight: '700' },

  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  emptyContent: { flex: 1, justifyContent: 'center' },

  card: { marginBottom: 10, backgroundColor: '#fff', borderRadius: 12 },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  bidangBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flex: 1,
    maxWidth: '70%',
  },
  bidangText: { color: palette.primary, fontWeight: '700' },

  judulRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  judul: { color: palette.onSurface, fontWeight: '600', flex: 1, lineHeight: 20 },

  mhsBox: {
    backgroundColor: palette.surfaceVariant,
    padding: 10,
    borderRadius: 10,
    gap: 4,
  },
  mhsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mhsName: { color: palette.onSurface, fontWeight: '600', flex: 1 },
  mhsMeta: { color: palette.onSurfaceVariant },

  approvalRow: { marginTop: 12 },
  approvalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.surfaceVariant,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  approvalBadgeDone: {
    backgroundColor: palette.successContainer,
  },
  approvalText: { color: palette.onSurfaceVariant, fontWeight: '600' },
  approvalTextDone: { color: palette.success, fontWeight: '700' },
  waitingBox: {
    marginTop: 10,
    backgroundColor: palette.warningContainer,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  waitingText: { color: '#92400e', fontStyle: 'italic' },

  actions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  actionBtn: { borderRadius: 10 },
  actionContent: { paddingVertical: 4 },
  rejectBtn: { borderColor: palette.errorContainer },

  /* Dialog */
  dialog: { backgroundColor: '#fff', borderRadius: 16 },
  dialogTitle: { color: palette.onSurface, fontWeight: '700' },
  dialogLabel: {
    color: palette.onSurfaceVariant,
    letterSpacing: 0.6,
    fontWeight: '700',
  },
  dialogValue: { color: palette.onSurface, marginTop: 2 },
  dialogInput: { backgroundColor: '#fff', marginTop: 6 },
});
