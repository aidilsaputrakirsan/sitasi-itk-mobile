import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Dialog,
  HelperText,
  Portal,
  Snackbar,
  Surface,
  Text,
  TextInput,
  TouchableRipple,
} from 'react-native-paper';
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronRight,
  ClipboardList,
  IdCard,
  MessageSquare,
  Users,
  X,
} from 'lucide-react-native';
import { bimbinganApi } from '../../api/endpoints/bimbingan';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import { palette } from '../../theme';
import type { Bimbingan, PaginationMeta } from '../../types';

function formatTanggal(iso?: string): string {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
}

type ReviewMode = 'approve' | 'reject';

interface MahasiswaGroup {
  userId: number;
  name: string;
  nim?: string;
  total: number;
  pending: number;
  lastTanggal?: string;
  bimbingans: Bimbingan[];
}

export function BimbinganDosenScreen() {
  const [items, setItems] = useState<Bimbingan[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Selected mahasiswa untuk detail view (null = list view)
  const [selectedMahasiswaId, setSelectedMahasiswaId] = useState<number | null>(null);

  // Review dialog state
  const [reviewItem, setReviewItem] = useState<Bimbingan | null>(null);
  const [reviewMode, setReviewMode] = useState<ReviewMode>('approve');
  const [hasilInput, setHasilInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState<{ visible: boolean; message: string; variant: 'success' | 'error' }>({
    visible: false,
    message: '',
    variant: 'success',
  });

  const showSnack = (message: string, variant: 'success' | 'error') =>
    setSnack({ visible: true, message, variant });

  const fetchData = useCallback(async (page = 1, append = false) => {
    try {
      const response = await bimbinganApi.list({ page, per_page: 50 });
      if (response.data.success) {
        // ── DIAGNOSTIC: cek apa yang backend kirim untuk field mahasiswa ──
        if (response.data.data[0]) {
          const first = response.data.data[0];
          console.log('[BimbinganDosen DEBUG] first item raw:', JSON.stringify({
            id: first.id,
            user_id: first.user_id,
            mahasiswa_nama: (first as { mahasiswa_nama?: unknown }).mahasiswa_nama,
            mahasiswa_nim: (first as { mahasiswa_nim?: unknown }).mahasiswa_nim,
            mahasiswa_keys: first.mahasiswa ? Object.keys(first.mahasiswa) : 'mahasiswa-null',
            mahasiswa_name: first.mahasiswa?.name,
            mahasiswa_nested_nama: first.mahasiswa?.mahasiswa?.nama,
          }, null, 2));
        }
        if (append) {
          setItems((prev) => [...prev, ...response.data.data]);
        } else {
          setItems(response.data.data);
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
  }, []);

  useEffect(() => {
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

  // Group bimbingan per mahasiswa (user_id)
  const mahasiswaGroups = useMemo<MahasiswaGroup[]>(() => {
    const map = new Map<number, MahasiswaGroup>();
    for (const b of items) {
      const userId = b.mahasiswa?.id ?? b.user_id;
      if (!userId) continue;
      // Resolve nama: prioritas flat field dari BimbinganResource baru.
      // Backend sudah pre-resolve: mahasiswa.nama -> user.name fallback.
      const resolvedName =
        b.mahasiswa_nama?.trim() ||
        b.mahasiswa?.mahasiswa?.nama?.trim() ||
        b.mahasiswa?.name?.trim() ||
        'Mahasiswa';
      const resolvedNim =
        b.mahasiswa_nim ||
        b.mahasiswa?.mahasiswa?.nim ||
        b.mahasiswa?.nim ||
        undefined;

      const existing = map.get(userId);
      const statusLower = String(b.status ?? '').toLowerCase();
      const isPending = statusLower === 'created';
      if (existing) {
        existing.bimbingans.push(b);
        existing.total += 1;
        if (isPending) existing.pending += 1;
        if (!existing.lastTanggal || (b.tanggal && b.tanggal > existing.lastTanggal)) {
          existing.lastTanggal = b.tanggal;
        }
        // Update name/nim kalau record ini punya data lebih lengkap
        if (existing.name === 'Mahasiswa' && resolvedName !== 'Mahasiswa') {
          existing.name = resolvedName;
        }
        if (!existing.nim && resolvedNim) {
          existing.nim = resolvedNim;
        }
      } else {
        map.set(userId, {
          userId,
          name: resolvedName,
          nim: resolvedNim,
          total: 1,
          pending: isPending ? 1 : 0,
          lastTanggal: b.tanggal,
          bimbingans: [b],
        });
      }
    }
    // Sort: yang punya pending paling atas, lalu by last tanggal desc
    return Array.from(map.values()).sort((a, b) => {
      if (a.pending !== b.pending) return b.pending - a.pending;
      return String(b.lastTanggal ?? '').localeCompare(String(a.lastTanggal ?? ''));
    });
  }, [items]);

  const selectedGroup = selectedMahasiswaId
    ? mahasiswaGroups.find((g) => g.userId === selectedMahasiswaId)
    : null;

  const openReview = (item: Bimbingan, mode: ReviewMode) => {
    setReviewItem(item);
    setReviewMode(mode);
    setHasilInput(item.hasil_bimbingan ?? '');
  };

  const closeReview = () => {
    if (submitting) return;
    setReviewItem(null);
    setHasilInput('');
  };

  const submitReview = async () => {
    if (!reviewItem) return;
    if (reviewMode === 'reject' && !hasilInput.trim()) {
      showSnack('Hasil/alasan harus diisi untuk reject', 'error');
      return;
    }
    setSubmitting(true);
    try {
      if (reviewMode === 'approve') {
        await bimbinganApi.approve(
          reviewItem.id,
          hasilInput.trim() ? { hasil_bimbingan: hasilInput } : undefined
        );
        showSnack('Bimbingan disetujui', 'success');
      } else {
        await bimbinganApi.reject(reviewItem.id, { hasil_bimbingan: hasilInput });
        showSnack('Bimbingan ditolak', 'success');
      }
      setReviewItem(null);
      setHasilInput('');
      fetchData(1);
    } catch (err: unknown) {
      showSnack((err as { message?: string }).message ?? 'Gagal memproses', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !refreshing) return <LoadingScreen />;

  // ── MODE DETAIL: list bimbingan per mahasiswa ─────────────────────────────
  if (selectedGroup) {
    return (
      <View style={styles.container}>
        {/* Header back + nama mahasiswa */}
        <Surface elevation={0} style={styles.detailHeader}>
          <TouchableRipple
            onPress={() => setSelectedMahasiswaId(null)}
            style={styles.backBtn}
            rippleColor="rgba(255,255,255,0.2)"
            borderless
          >
            <ArrowLeft size={22} color="#fff" strokeWidth={2.2} />
          </TouchableRipple>
          <Surface elevation={0} style={styles.avatarLg}>
            <Text variant="titleLarge" style={styles.avatarLgText}>
              {selectedGroup.name.charAt(0).toUpperCase()}
            </Text>
          </Surface>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={styles.detailName} numberOfLines={1}>
              {selectedGroup.name}
            </Text>
            {selectedGroup.nim && (
              <Text variant="bodySmall" style={styles.detailNim}>
                NIM {selectedGroup.nim}
              </Text>
            )}
            <View style={styles.detailStatsRow}>
              <Surface elevation={0} style={styles.detailStat}>
                <Text variant="labelSmall" style={styles.detailStatText}>
                  {selectedGroup.total} bimbingan
                </Text>
              </Surface>
              {selectedGroup.pending > 0 && (
                <Surface elevation={0} style={[styles.detailStat, styles.detailStatPending]}>
                  <Text variant="labelSmall" style={styles.detailStatTextPending}>
                    {selectedGroup.pending} menunggu
                  </Text>
                </Surface>
              )}
            </View>
          </View>
        </Surface>

        {/* List bimbingan untuk mahasiswa ini */}
        <FlatList
          data={selectedGroup.bimbingans}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <BimbinganDetailCard item={item} onReview={(mode) => openReview(item, mode)} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[palette.primary]} />
          }
        />

        <ReviewDialog
          reviewItem={reviewItem}
          reviewMode={reviewMode}
          hasilInput={hasilInput}
          setHasilInput={setHasilInput}
          submitting={submitting}
          onClose={closeReview}
          onSubmit={submitReview}
        />

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

  // ── MODE LIST: list mahasiswa (grouped) ───────────────────────────────────
  return (
    <View style={styles.container}>
      <FlatList
        data={mahasiswaGroups}
        keyExtractor={(item) => String(item.userId)}
        renderItem={({ item }) => (
          <MahasiswaCard group={item} onPress={() => setSelectedMahasiswaId(item.userId)} />
        )}
        ListHeaderComponent={
          mahasiswaGroups.length > 0 ? (
            <View style={styles.listHeader}>
              <Users size={16} color={palette.onSurfaceVariant} strokeWidth={2} />
              <Text variant="bodySmall" style={styles.listHeaderText}>
                {mahasiswaGroups.length} mahasiswa bimbingan
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={<EmptyState message="Belum ada mahasiswa bimbingan" />}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={{ marginVertical: 16 }} color={palette.primary} />
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[palette.primary]} />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        contentContainerStyle={
          mahasiswaGroups.length === 0 ? styles.emptyContent : styles.listContent
        }
      />

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

// ── Card mahasiswa di list view ─────────────────────────────────────────────

function MahasiswaCard({
  group,
  onPress,
}: {
  group: MahasiswaGroup;
  onPress: () => void;
}) {
  // Inisial dari kata pertama+kedua nama (mis "Devina Dian" → "DD")
  const initial = group.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase())
    .join('') || 'M';

  return (
    <Card mode="elevated" style={styles.mhsCard}>
      <TouchableRipple onPress={onPress} rippleColor="rgba(30,108,183,0.08)">
        <View style={styles.mhsCardInner}>
          <Surface elevation={0} style={styles.avatar}>
            <Text variant="titleMedium" style={styles.avatarText}>
              {initial}
            </Text>
          </Surface>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="titleSmall" style={styles.mhsName} numberOfLines={1}>
              {group.name}
            </Text>
            {group.nim ? (
              <View style={styles.mhsMetaRow}>
                <IdCard size={12} color={palette.onSurfaceVariant} strokeWidth={2} />
                <Text variant="labelSmall" style={styles.mhsMeta}>
                  NIM {group.nim}
                </Text>
              </View>
            ) : null}

            {/* Badge stats — pakai View custom (Paper Chip terpotong di iOS) */}
            <View style={styles.mhsStatsRow}>
              <View style={styles.statBadge}>
                <ClipboardList size={12} color={palette.primary} strokeWidth={2.4} />
                <Text style={styles.statBadgeText}>
                  {group.total} bimbingan
                </Text>
              </View>
              {group.pending > 0 && (
                <View style={[styles.statBadge, styles.statBadgePending]}>
                  <Text style={styles.statBadgeTextPending}>
                    {group.pending} menunggu
                  </Text>
                </View>
              )}
            </View>
          </View>
          <ChevronRight size={20} color={palette.onSurfaceVariant} strokeWidth={2} />
        </View>
      </TouchableRipple>
    </Card>
  );
}

// ── Card bimbingan di detail view ────────────────────────────────────────────

function BimbinganDetailCard({
  item,
  onReview,
}: {
  item: Bimbingan;
  onReview: (mode: ReviewMode) => void;
}) {
  const statusLower = String(item.status ?? '').toLowerCase();
  const isCreated = statusLower === 'created';

  return (
    <Card mode="elevated" style={styles.detailCard}>
      <Card.Content style={{ paddingVertical: 14 }}>
        {/* Header: tanggal + status */}
        <View style={styles.detailCardHeader}>
          <Surface elevation={0} style={styles.tanggalChip}>
            <Calendar size={14} color={palette.primary} strokeWidth={2} />
            <Text variant="bodySmall" style={styles.tanggalText}>
              {formatTanggal(item.tanggal)}
            </Text>
          </Surface>
          <StatusBadge status={item.status} />
        </View>

        {/* Keterangan */}
        <View style={styles.section}>
          <Text variant="labelSmall" style={styles.sectionLabel}>
            KETERANGAN
          </Text>
          <Text variant="bodyMedium" style={styles.ket}>
            {item.ket_bimbingan}
          </Text>
        </View>

        {/* Hasil bimbingan */}
        {item.hasil_bimbingan && (
          <Surface elevation={0} style={styles.hasilBox}>
            <View style={styles.hasilHeader}>
              <MessageSquare size={14} color={palette.success} strokeWidth={2} />
              <Text variant="labelSmall" style={styles.hasilLabel}>
                HASIL BIMBINGAN
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.hasilText}>
              {item.hasil_bimbingan}
            </Text>
          </Surface>
        )}

        {/* Actions */}
        {isCreated && (
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
      </Card.Content>
    </Card>
  );
}

// ── Review Dialog ────────────────────────────────────────────────────────────

function ReviewDialog({
  reviewItem,
  reviewMode,
  hasilInput,
  setHasilInput,
  submitting,
  onClose,
  onSubmit,
}: {
  reviewItem: Bimbingan | null;
  reviewMode: ReviewMode;
  hasilInput: string;
  setHasilInput: (v: string) => void;
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Portal>
      <Dialog visible={!!reviewItem} onDismiss={onClose} style={styles.dialog}>
        <Dialog.Title style={styles.dialogTitle}>
          {reviewMode === 'approve' ? 'Setujui Bimbingan' : 'Tolak Bimbingan'}
        </Dialog.Title>
        <Dialog.Content>
          {reviewItem && (
            <>
              <Text variant="labelSmall" style={styles.dialogLabel}>
                TANGGAL
              </Text>
              <Text variant="bodyMedium" style={styles.dialogValue}>
                {formatTanggal(reviewItem.tanggal)}
              </Text>

              <Text variant="labelSmall" style={[styles.dialogLabel, { marginTop: 12 }]}>
                KETERANGAN MAHASISWA
              </Text>
              <Text variant="bodyMedium" style={styles.dialogValue}>
                {reviewItem.ket_bimbingan}
              </Text>

              <Text variant="labelSmall" style={[styles.dialogLabel, { marginTop: 16 }]}>
                HASIL BIMBINGAN {reviewMode === 'reject' && '*'}
              </Text>
              <TextInput
                mode="outlined"
                value={hasilInput}
                onChangeText={setHasilInput}
                placeholder={
                  reviewMode === 'approve'
                    ? 'Catatan / arahan (opsional)'
                    : 'Alasan penolakan...'
                }
                multiline
                numberOfLines={3}
                style={styles.dialogInput}
              />
              <HelperText type="info" visible={reviewMode === 'approve'}>
                Opsional — kosongkan jika tidak ada catatan
              </HelperText>
            </>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button
            mode="contained"
            onPress={onSubmit}
            loading={submitting}
            disabled={submitting}
            buttonColor={reviewMode === 'approve' ? palette.success : palette.error}
          >
            {reviewMode === 'approve' ? 'Setujui' : 'Tolak'}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  listContent: { padding: 16, paddingBottom: 24 },
  emptyContent: { flex: 1, justifyContent: 'center' },

  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  listHeaderText: {
    color: palette.onSurfaceVariant,
    letterSpacing: 0.3,
    fontWeight: '600',
  },

  /* Mahasiswa card (list view) */
  mhsCard: { marginBottom: 10, backgroundColor: '#fff', borderRadius: 12 },
  mhsCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800' },
  mhsName: { color: palette.onSurface, fontWeight: '700' },
  mhsMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  mhsMeta: { color: palette.onSurfaceVariant },

  mhsStatsRow: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: palette.primaryContainer,
  },
  statBadgeText: {
    color: palette.primary,
    fontWeight: '700',
    fontSize: 11,
    lineHeight: 14,
  },
  statBadgePending: { backgroundColor: palette.warningContainer },
  statBadgeTextPending: {
    color: '#92400e',
    fontWeight: '700',
    fontSize: 11,
    lineHeight: 14,
  },

  /* Detail header (after tap) */
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: palette.primary,
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLgText: { color: '#fff', fontWeight: '800' },
  detailName: { color: '#fff', fontWeight: '700' },
  detailNim: { color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  detailStatsRow: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  detailStat: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  detailStatText: { color: '#fff', fontWeight: '600' },
  detailStatPending: { backgroundColor: palette.warning },
  detailStatTextPending: { color: '#fff', fontWeight: '700' },

  /* Detail card */
  detailCard: { marginBottom: 10, backgroundColor: '#fff', borderRadius: 12 },
  detailCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  tanggalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.surfaceVariant,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tanggalText: { color: palette.onSurface, fontWeight: '600' },

  section: { marginBottom: 4 },
  sectionLabel: {
    color: palette.onSurfaceVariant,
    letterSpacing: 0.6,
    fontWeight: '700',
    marginBottom: 4,
  },
  ket: { color: palette.onSurface, lineHeight: 20 },

  hasilBox: {
    marginTop: 12,
    backgroundColor: palette.successContainer,
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: palette.success,
  },
  hasilHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  hasilLabel: {
    color: palette.success,
    letterSpacing: 0.6,
    fontWeight: '700',
  },
  hasilText: { color: palette.onSurface, lineHeight: 19 },

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
