import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Card, Surface, Text, TouchableRipple } from 'react-native-paper';
import {
  Bell,
  ChevronRight,
  ClipboardCheck,
  ClipboardEdit,
  GraduationCap,
  Presentation,
  Sparkles,
  type LucideIcon,
} from 'lucide-react-native';
import { SemproDosenScreen } from './SemproDosenScreen';
import { SidangDosenScreen } from './SidangDosenScreen';
import { penilaianApi } from '../../api/endpoints/penilaian';
import { TabHeader } from '../../components/ui/TabHeader';
import { palette } from '../../theme';
import type {
  PenilaianListItemSempro,
  PenilaianListItemSidang,
  PenilaianRole,
} from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

type AkademikTab = 'sempro' | 'sidang';

interface Counters {
  approveSempro: number;
  approveSidang: number;
  revisiSempro: number;
  revisiSidang: number;
  totalAction: number;
}

function myApproveDone(item: PenilaianListItemSempro | PenilaianListItemSidang): boolean {
  if (!item.is_pembimbing) return true; // penguji tidak approve
  const role = item.my_role as PenilaianRole;
  return role === 'pembimbing_1'
    ? !!item.approve_pembimbing_1
    : !!item.approve_pembimbing_2;
}

function myRevisiDone(item: PenilaianListItemSempro | PenilaianListItemSidang): boolean {
  const role = item.my_role as PenilaianRole;
  const key = `revisi_${role}` as keyof typeof item;
  return !!item[key];
}

function computeCounters(
  semproItems: PenilaianListItemSempro[],
  sidangItems: PenilaianListItemSidang[],
): Counters {
  const approveSempro = semproItems.filter((s) => !myApproveDone(s)).length;
  // Sidang: hanya yang sudah punya record SidangTA yang bisa di-approve
  const approveSidang = sidangItems.filter(
    (s) => s.has_sidang !== false && !myApproveDone(s)
  ).length;
  const revisiSempro = semproItems.filter((s) => !myRevisiDone(s)).length;
  const revisiSidang = sidangItems.filter(
    (s) => s.has_sidang !== false && !myRevisiDone(s)
  ).length;

  return {
    approveSempro,
    approveSidang,
    revisiSempro,
    revisiSidang,
    totalAction: approveSempro + approveSidang + revisiSempro + revisiSidang,
  };
}

export function AkademikDosenScreen({ navigation }: Props) {
  const [tab, setTab] = useState<AkademikTab>('sempro');
  const [counters, setCounters] = useState<Counters | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCounters = useCallback(async () => {
    try {
      setLoading(true);
      const [semproRes, sidangRes] = await Promise.all([
        penilaianApi.listSempro('all'),
        penilaianApi.listSidang('all'),
      ]);
      const sempro = semproRes.data.success ? semproRes.data.data : [];
      const sidang = sidangRes.data.success ? sidangRes.data.data : [];
      setCounters(computeCounters(sempro, sidang));
    } catch {
      setCounters({
        approveSempro: 0,
        approveSidang: 0,
        revisiSempro: 0,
        revisiSidang: 0,
        totalAction: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounters();
  }, [fetchCounters]);

  // Compact actions list — hanya tampilkan kategori yang count > 0
  const actionItems = useMemo(() => {
    if (!counters) return [];
    const items: {
      key: string;
      label: string;
      count: number;
      Icon: LucideIcon;
      tint: string;
      onPress: () => void;
    }[] = [];
    if (counters.approveSempro > 0) {
      items.push({
        key: 'app-sempro',
        label: 'Sempro belum disetujui',
        count: counters.approveSempro,
        Icon: ClipboardCheck,
        tint: palette.tertiary,
        onPress: () => setTab('sempro'),
      });
    }
    if (counters.approveSidang > 0) {
      items.push({
        key: 'app-sidang',
        label: 'Sidang belum disetujui',
        count: counters.approveSidang,
        Icon: ClipboardCheck,
        tint: palette.tertiary,
        onPress: () => setTab('sidang'),
      });
    }
    if (counters.revisiSempro > 0) {
      items.push({
        key: 'rev-sempro',
        label: 'Revisi sempro menunggu',
        count: counters.revisiSempro,
        Icon: ClipboardEdit,
        tint: palette.warning,
        onPress: () => setTab('sempro'),
      });
    }
    if (counters.revisiSidang > 0) {
      items.push({
        key: 'rev-sidang',
        label: 'Revisi sidang menunggu',
        count: counters.revisiSidang,
        Icon: ClipboardEdit,
        tint: palette.warning,
        onPress: () => setTab('sidang'),
      });
    }
    return items;
  }, [counters]);

  return (
    <View style={styles.root}>
      <TabHeader title="Akademik" subtitle="Persetujuan & penilaian" />
      {/* Action Inbox Banner — fixed di atas */}
      <View style={styles.bannerWrap}>
        {loading ? (
          <Card mode="elevated" style={styles.bannerCard}>
            <Card.Content style={styles.loadingRow}>
              <ActivityIndicator size="small" color={palette.primary} />
              <Text variant="bodyMedium" style={styles.loadingText}>
                Memuat ringkasan…
              </Text>
            </Card.Content>
          </Card>
        ) : counters && counters.totalAction === 0 ? (
          <Card mode="elevated" style={[styles.bannerCard, styles.bannerCardClear]}>
            <Card.Content style={styles.clearRow}>
              <Surface elevation={0} style={styles.clearIcon}>
                <Sparkles size={20} color={palette.success} strokeWidth={2} />
              </Surface>
              <View style={{ flex: 1 }}>
                <Text variant="titleSmall" style={styles.clearTitle}>
                  Semua tindakan selesai
                </Text>
                <Text variant="bodySmall" style={styles.clearSubtitle}>
                  Tidak ada persetujuan atau revisi yang menunggu Anda saat ini.
                </Text>
              </View>
            </Card.Content>
          </Card>
        ) : (
          <Card mode="elevated" style={styles.bannerCard}>
            <Card.Content>
              <View style={styles.bannerHeader}>
                <Surface elevation={0} style={styles.bannerIcon}>
                  <Bell size={18} color={palette.tertiary} strokeWidth={2.4} />
                </Surface>
                <View style={{ flex: 1 }}>
                  <Text variant="labelSmall" style={styles.bannerLabel}>
                    BUTUH TINDAKAN ANDA
                  </Text>
                  <Text variant="titleMedium" style={styles.bannerTitle}>
                    {counters?.totalAction ?? 0} item perlu diproses
                  </Text>
                </View>
              </View>
              <View style={styles.actionList}>
                {actionItems.map((act, idx) => (
                  <React.Fragment key={act.key}>
                    {idx > 0 && <View style={styles.actionDivider} />}
                    <TouchableRipple
                      onPress={act.onPress}
                      rippleColor="rgba(30,108,183,0.08)"
                      style={styles.actionRow}
                    >
                      <View style={styles.actionRowInner}>
                        <Surface
                          elevation={0}
                          style={[styles.actionIconBox, { backgroundColor: act.tint + '1A' }]}
                        >
                          <act.Icon size={16} color={act.tint} strokeWidth={2} />
                        </Surface>
                        <Text variant="bodyMedium" style={styles.actionLabel}>
                          {act.label}
                        </Text>
                        <View style={[styles.actionCount, { backgroundColor: act.tint }]}>
                          <Text variant="labelMedium" style={styles.actionCountText}>
                            {act.count}
                          </Text>
                        </View>
                        <ChevronRight
                          size={16}
                          color={palette.onSurfaceVariant}
                          strokeWidth={2}
                        />
                      </View>
                    </TouchableRipple>
                  </React.Fragment>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}
      </View>

      {/* Sticky segmented switcher */}
      <Surface elevation={0} style={styles.segmentBar}>
        <SegmentButton
          label="Sempro"
          Icon={Presentation}
          active={tab === 'sempro'}
          onPress={() => setTab('sempro')}
        />
        <SegmentButton
          label="Sidang TA"
          Icon={GraduationCap}
          active={tab === 'sidang'}
          onPress={() => setTab('sidang')}
        />
      </Surface>

      {/* Content — child FlatList scroll sendiri */}
      <View style={styles.content}>
        {tab === 'sempro' ? (
          <SemproDosenScreen navigation={navigation} />
        ) : (
          <SidangDosenScreen navigation={navigation} />
        )}
      </View>
    </View>
  );
}

function SegmentButton({
  label,
  Icon,
  active,
  onPress,
}: {
  label: string;
  Icon: LucideIcon;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableRipple
      onPress={onPress}
      rippleColor="rgba(30,108,183,0.12)"
      style={[styles.segment, active && styles.segmentActive]}
    >
      <View style={styles.segmentInner}>
        <Icon
          size={18}
          color={active ? '#fff' : palette.onSurfaceVariant}
          strokeWidth={active ? 2.4 : 2}
        />
        <Text
          variant="labelLarge"
          style={[styles.segmentText, active && styles.segmentTextActive]}
        >
          {label}
        </Text>
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },

  bannerWrap: { paddingTop: 12 },
  bannerCard: { marginHorizontal: 16, backgroundColor: '#fff' },
  bannerCardClear: { backgroundColor: palette.successContainer },

  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  bannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: palette.tertiaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerLabel: {
    color: palette.onSurfaceVariant,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  bannerTitle: { color: palette.onSurface, fontWeight: '700', marginTop: 2 },

  actionList: { gap: 0 },
  actionDivider: { height: 1, backgroundColor: palette.outlineVariant, marginHorizontal: -16 },
  actionRow: { marginHorizontal: -16, paddingHorizontal: 16 },
  actionRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  actionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { color: palette.onSurface, flex: 1, fontWeight: '500' },
  actionCount: {
    minWidth: 24,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCountText: { color: '#fff', fontWeight: '800', fontSize: 11 },

  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  loadingText: { color: palette.onSurfaceVariant },

  clearRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  clearIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearTitle: { color: palette.success, fontWeight: '700' },
  clearSubtitle: { color: '#14532d', marginTop: 2, lineHeight: 18 },

  segmentBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: palette.outlineVariant,
    marginTop: 12,
  },
  segment: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: palette.surfaceVariant,
    overflow: 'hidden',
  },
  segmentActive: { backgroundColor: palette.primary },
  segmentInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  segmentText: { color: palette.onSurfaceVariant, fontWeight: '700' },
  segmentTextActive: { color: '#fff' },
  content: { flex: 1 },
});
