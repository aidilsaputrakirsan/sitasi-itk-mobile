import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Surface, Text, TouchableRipple, Button, Chip, ProgressBar } from 'react-native-paper';
import {
  ArrowRight,
  BellRing,
  Calendar,
  Check,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock,
  FileText,
  FolderKanban,
  GraduationCap,
  Library,
  ListChecks,
  MapPin,
  Presentation,
  Settings,
  Sparkles,
  UsersRound,
  type LucideIcon,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';
import { dashboardApi } from '../../api/endpoints/dashboard';
import { useNotificationCount } from '../../hooks/useNotification';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { AnimatedLogo } from '../../components/ui/AnimatedLogo';
import { palette } from '../../theme';
import { getUserDisplayName, getUserIdentifier } from '../../utils/userDisplay';
import sitasiLogo from '../../../assets/logo-sitasi.webp';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

// ── Types ─────────────────────────────────────────────────────────────────────

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

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function countdownLabel(iso?: string): string {
  const d = daysUntil(iso);
  if (d === null) return '';
  if (d < 0) return 'Sudah lewat';
  if (d === 0) return 'Hari ini';
  if (d === 1) return 'Besok';
  return `${d} hari lagi`;
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export function DashboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
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

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading && !refreshing) return <LoadingScreen />;
  if (error && !data) return <ErrorMessage message={error} onRetry={fetchDashboard} />;

  const role = getPrimaryRole();
  const displayName = getUserDisplayName(user);
  const identifier = getUserIdentifier(user);
  const firstName = displayName.split(' ')[0];

  const roleLabel =
    role === 'mahasiswa'
      ? `Mahasiswa${identifier !== '-' ? ` · ${identifier}` : ''}`
      : role === 'dosen'
      ? `Dosen${identifier !== '-' ? ` · ${identifier}` : ''}`
      : role === 'tendik'
      ? 'Tenaga Kependidikan'
      : role === 'koorpro'
      ? 'Koordinator Program'
      : '-';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[palette.primary]} />
      }
    >
      {/* Welcome dengan logo */}
      <Surface elevation={0} style={[styles.welcome, { marginTop: insets.top + 12 }]}>
        <View style={{ flex: 1 }}>
          <Text variant="bodySmall" style={styles.greeting}>
            Halo,
          </Text>
          <Text variant="headlineSmall" style={styles.userName} numberOfLines={1}>
            {firstName} 👋
          </Text>
          <Text variant="bodySmall" style={styles.roleText} numberOfLines={1}>
            {roleLabel}
          </Text>
        </View>
        <AnimatedLogo source={sitasiLogo} size={72} />
      </Surface>

      {/* Notifikasi banner */}
      {unreadCount > 0 && (
        <Card
          mode="contained"
          style={styles.notifBanner}
          onPress={() => navigation.navigate('Notifikasi')}
        >
          <Card.Content style={styles.notifContent}>
            <Surface elevation={0} style={styles.notifIcon}>
              <BellRing size={20} color={palette.warning} strokeWidth={2} />
            </Surface>
            <View style={{ flex: 1 }}>
              <Text variant="titleSmall" style={styles.notifTitle}>
                {unreadCount} notifikasi baru
              </Text>
              <Text variant="bodySmall" style={styles.notifSub}>
                Ketuk untuk lihat pusat notifikasi
              </Text>
            </View>
            <ChevronRight size={18} color={palette.warning} strokeWidth={2} />
          </Card.Content>
        </Card>
      )}

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

type StepState = 'done' | 'current' | 'locked';
interface Step {
  key: string;
  label: string;
  Icon: LucideIcon;
  state: StepState;
}

function deriveSteps(d: MahasiswaDashboard): Step[] {
  const pengajuanDone =
    !!d.pengajuan_ta && (d.pengajuan_ta.status === 'approved' || d.pengajuan_ta.status === 'Diterima');
  const pengajuanExist = !!d.pengajuan_ta;
  const bimbinganDone = d.bimbingan.approved > 0;
  const semproDone =
    !!d.sempro && (d.sempro.status === 'approved' || d.sempro.status === 'Diterima');
  const semproExist = !!d.sempro;
  const sidangDone =
    !!d.sidang && (d.sidang.status === 'approved' || d.sidang.status === 'Diterima');
  const sidangExist = !!d.sidang;

  const state = (done: boolean, exist: boolean, prevDone: boolean): StepState => {
    if (done) return 'done';
    if (exist || prevDone) return 'current';
    return 'locked';
  };

  return [
    { key: 'pengajuan', label: 'Pengajuan', Icon: FileText, state: state(pengajuanDone, pengajuanExist, true) },
    { key: 'bimbingan', label: 'Bimbingan', Icon: ClipboardList, state: state(bimbinganDone, bimbinganDone, pengajuanDone) },
    { key: 'sempro', label: 'Sempro', Icon: Presentation, state: state(semproDone, semproExist, bimbinganDone) },
    { key: 'sidang', label: 'Sidang', Icon: GraduationCap, state: state(sidangDone, sidangExist, semproDone) },
  ];
}

interface NextAction {
  title: string;
  description: string;
  Icon: LucideIcon;
  cta: string;
  onPress: () => void;
  tint?: string;
}

function deriveNextAction(d: MahasiswaDashboard, navigation: Props['navigation']): NextAction {
  // Belum ada pengajuan
  if (!d.pengajuan_ta) {
    return {
      title: 'Mulai Pengajuan TA',
      description: 'Anda belum mengajukan tugas akhir. Ajukan topik dan pilih pembimbing Anda.',
      Icon: Sparkles,
      cta: 'Ajukan TA',
      onPress: () => navigation.navigate('PengajuanTAForm', { id: undefined }),
      tint: palette.tertiary,
    };
  }
  // Pengajuan belum approved
  if (d.pengajuan_ta.status !== 'approved') {
    const a1 = d.pengajuan_ta.approve_pembimbing1;
    const a2 = d.pengajuan_ta.approve_pembimbing2;
    const desc =
      !a1 && !a2
        ? 'Menunggu approval dari kedua pembimbing.'
        : !a1
        ? 'Menunggu approval Pembimbing 1.'
        : !a2
        ? 'Menunggu approval Pembimbing 2.'
        : 'Pengajuan sedang diproses.';
    return {
      title: 'Pengajuan TA sedang diproses',
      description: desc,
      Icon: Clock,
      cta: 'Lihat Pengajuan',
      onPress: () => navigation.navigate('PengajuanTA'),
    };
  }
  // Sidang
  if (d.sidang && d.sidang.status !== 'approved' && d.sidang.status !== 'Diterima') {
    return {
      title: 'Sidang TA Anda sedang berjalan',
      description: `Status: ${d.sidang.status}${d.sidang.revisi_lengkap === false ? ' · Revisi belum lengkap' : ''}.`,
      Icon: GraduationCap,
      cta: 'Lihat Sidang',
      onPress: () => navigation.navigate('Sidang'),
    };
  }
  // Sempro
  if (d.sempro && d.sempro.status !== 'approved' && d.sempro.status !== 'Diterima') {
    return {
      title: 'Sempro Anda sedang diproses',
      description: `Status: ${d.sempro.status}${d.sempro.periode ? ` · ${d.sempro.periode}` : ''}.`,
      Icon: Presentation,
      cta: 'Lihat Sempro',
      onPress: () => navigation.navigate('Sempro'),
    };
  }
  // Sempro sudah approved, belum daftar sidang
  if (d.sempro && (d.sempro.status === 'approved' || d.sempro.status === 'Diterima') && !d.sidang) {
    return {
      title: 'Saatnya daftar Sidang TA',
      description: 'Sempro Anda sudah disetujui. Lanjutkan dengan pendaftaran Sidang TA.',
      Icon: GraduationCap,
      cta: 'Daftar Sidang',
      onPress: () => navigation.navigate('Sidang'),
      tint: palette.tertiary,
    };
  }
  // Pengajuan approved, belum sempro
  if (!d.sempro) {
    return {
      title: 'Catat bimbingan & daftar Sempro',
      description: 'Pengajuan TA disetujui. Aktif bimbingan dan daftar Seminar Proposal saat siap.',
      Icon: ClipboardList,
      cta: 'Catat Bimbingan',
      onPress: () => navigation.navigate('Bimbingan'),
      tint: palette.tertiary,
    };
  }
  // Sidang done
  return {
    title: 'Selamat! TA Anda telah selesai',
    description: 'Anda bisa mengajukan katalog TA untuk publikasi.',
    Icon: Library,
    cta: 'Lihat Katalog',
    onPress: () => navigation.navigate('Katalog'),
    tint: palette.success,
  };
}

function MahasiswaDashboardView({
  data,
  navigation,
}: {
  data: MahasiswaDashboard;
  navigation: Props['navigation'];
}) {
  const steps = deriveSteps(data);
  const action = deriveNextAction(data, navigation);
  const doneCount = steps.filter((s) => s.state === 'done').length;
  const progress = doneCount / steps.length;

  return (
    <>
      {/* Progress Tracker TA */}
      <Card mode="elevated" style={styles.progressCard}>
        <Card.Content>
          <View style={styles.rowBetween}>
            <Text variant="titleSmall" style={styles.progressTitle}>
              Progres Tugas Akhir
            </Text>
            <Chip
              compact
              style={styles.progressChip}
              textStyle={styles.progressChipText}
            >
              {doneCount}/{steps.length}
            </Chip>
          </View>
          <ProgressBar
            progress={progress}
            color={palette.primary}
            style={styles.progressBar}
          />
          <View style={styles.stepsRow}>
            {steps.map((step, idx) => (
              <React.Fragment key={step.key}>
                <View style={styles.stepItem}>
                  <Surface
                    elevation={0}
                    style={[
                      styles.stepIcon,
                      step.state === 'done' && styles.stepIconDone,
                      step.state === 'current' && styles.stepIconCurrent,
                      step.state === 'locked' && styles.stepIconLocked,
                    ]}
                  >
                    {step.state === 'done' ? (
                      <Check size={16} color="#fff" strokeWidth={3} />
                    ) : (
                      <step.Icon
                        size={16}
                        color={step.state === 'current' ? palette.primary : palette.onSurfaceVariant}
                        strokeWidth={2}
                      />
                    )}
                  </Surface>
                  <Text
                    variant="labelSmall"
                    style={[
                      styles.stepLabel,
                      step.state === 'current' && { color: palette.primary, fontWeight: '700' },
                    ]}
                    numberOfLines={1}
                  >
                    {step.label}
                  </Text>
                </View>
                {idx < steps.length - 1 && (
                  <View
                    style={[
                      styles.stepConnector,
                      step.state === 'done' && styles.stepConnectorDone,
                    ]}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Next Action Card */}
      <Card mode="elevated" style={styles.nextActionCard} onPress={action.onPress}>
        <Card.Content>
          <View style={styles.actionHeader}>
            <Surface
              elevation={0}
              style={[
                styles.actionIcon,
                { backgroundColor: (action.tint ?? palette.primary) + '22' },
              ]}
            >
              <action.Icon
                size={22}
                color={action.tint ?? palette.primary}
                strokeWidth={2}
              />
            </Surface>
            <View style={{ flex: 1 }}>
              <Text variant="labelSmall" style={styles.actionLabel}>
                LANGKAH BERIKUTNYA
              </Text>
              <Text variant="titleMedium" style={styles.actionTitle}>
                {action.title}
              </Text>
            </View>
          </View>
          <Text variant="bodySmall" style={styles.actionDesc}>
            {action.description}
          </Text>
          <Button
            mode="contained"
            onPress={action.onPress}
            icon={({ size, color }) => <ArrowRight size={size} color={color} strokeWidth={2} />}
            contentStyle={{ flexDirection: 'row-reverse', paddingVertical: 4 }}
            style={[styles.actionBtn, { backgroundColor: action.tint ?? palette.primary }]}
          >
            {action.cta}
          </Button>
        </Card.Content>
      </Card>

      {/* Upcoming Schedule — DITONJOLKAN di atas */}
      {data.jadwal_sempro?.tanggal && (
        <>
          <SectionTitle title="Jadwal Mendatang" />
          <Card
            mode="elevated"
            style={[styles.infoCard, styles.scheduleCard]}
            onPress={() => navigation.navigate('Jadwal')}
          >
            <Card.Content>
              <View style={styles.rowBetween}>
                <Chip
                  compact
                  icon={() => <Clock size={14} color={palette.tertiary} strokeWidth={2.4} />}
                  style={styles.countdownChip}
                  textStyle={styles.countdownText}
                >
                  {countdownLabel(data.jadwal_sempro.tanggal)}
                </Chip>
                <Text variant="labelSmall" style={styles.scheduleType}>
                  SEMPRO
                </Text>
              </View>
              <Text variant="titleMedium" style={styles.scheduleDate}>
                {new Date(data.jadwal_sempro.tanggal).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              {data.jadwal_sempro.waktu && (
                <View style={styles.scheduleMetaRow}>
                  <Clock size={14} color={palette.onSurfaceVariant} strokeWidth={2} />
                  <Text variant="bodySmall" style={styles.scheduleMeta}>
                    {data.jadwal_sempro.waktu}
                  </Text>
                </View>
              )}
              {data.jadwal_sempro.ruangan && (
                <View style={styles.scheduleMetaRow}>
                  <MapPin size={14} color={palette.onSurfaceVariant} strokeWidth={2} />
                  <Text variant="bodySmall" style={styles.scheduleMeta}>
                    {data.jadwal_sempro.ruangan}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </>
      )}

      {/* Stats Bimbingan kompak */}
      <SectionTitle title="Bimbingan" />
      <View style={styles.statsRow}>
        <StatCard label="Total" value={data.bimbingan.total} Icon={ClipboardList} />
        <StatCard label="Disetujui" value={data.bimbingan.approved} Icon={ClipboardCheck} color={palette.success} />
        <StatCard label="Pending" value={data.bimbingan.pending} Icon={ListChecks} color={palette.warning} />
      </View>

      {/* Pengajuan TA */}
      {data.pengajuan_ta && (
        <>
          <SectionTitle title="Pengajuan TA" />
          <Card
            mode="elevated"
            style={styles.infoCard}
            onPress={() => navigation.navigate('PengajuanTA')}
          >
            <Card.Content>
              <View style={styles.rowBetween}>
                <Text variant="labelSmall" style={styles.label}>STATUS</Text>
                <StatusBadge status={data.pengajuan_ta.status} />
              </View>
              <Text variant="titleMedium" style={styles.cardTitle} numberOfLines={2}>
                {data.pengajuan_ta.judul}
              </Text>
              {data.pengajuan_ta.pembimbing_1 && (
                <Text variant="bodySmall" style={styles.meta}>
                  Pembimbing 1: {data.pengajuan_ta.pembimbing_1}
                </Text>
              )}
              {data.pengajuan_ta.pembimbing_2 && (
                <Text variant="bodySmall" style={styles.meta}>
                  Pembimbing 2: {data.pengajuan_ta.pembimbing_2}
                </Text>
              )}
            </Card.Content>
          </Card>
        </>
      )}

      {/* Periode aktif */}
      {(data.active_periode?.sempro || data.active_periode?.ta) && (
        <>
          <SectionTitle title="Periode Aktif" />
          <Card mode="elevated" style={styles.infoCard}>
            <Card.Content>
              {data.active_periode.sempro && (
                <Text variant="bodySmall" style={styles.meta}>
                  Sempro: {data.active_periode.sempro}
                </Text>
              )}
              {data.active_periode.ta && (
                <Text variant="bodySmall" style={styles.meta}>
                  TA: {data.active_periode.ta}
                </Text>
              )}
            </Card.Content>
          </Card>
        </>
      )}

      {/* Menu cepat */}
      <SectionTitle title="Menu Cepat" />
      <View style={styles.menuGrid}>
        <MenuTile label="Bimbingan" Icon={ClipboardList} onPress={() => navigation.navigate('Bimbingan')} />
        <MenuTile label="Pengajuan TA" Icon={FileText} onPress={() => navigation.navigate('PengajuanTA')} />
        <MenuTile label="Sempro" Icon={Presentation} onPress={() => navigation.navigate('Sempro')} />
        <MenuTile label="Sidang" Icon={GraduationCap} onPress={() => navigation.navigate('Sidang')} />
        <MenuTile label="Katalog" Icon={Library} onPress={() => navigation.navigate('Katalog')} />
        <MenuTile label="Jadwal" Icon={Calendar} onPress={() => navigation.navigate('Jadwal')} />
      </View>
    </>
  );
}

// ── Dosen Dashboard ───────────────────────────────────────────────────────────

function DosenDashboardView({
  data,
  navigation,
}: {
  data: DosenDashboard;
  navigation: Props['navigation'];
}) {
  const totalPending = data.stats.bimbingan_pending + data.stats.pengajuan_pending;

  return (
    <>
      {/* CTA Approval Pending */}
      {totalPending > 0 && (
        <Card
          mode="elevated"
          style={styles.approvalCard}
          onPress={() => navigation.navigate('BimbinganDosen')}
        >
          <Card.Content>
            <View style={styles.approvalHeader}>
              <Surface elevation={0} style={styles.approvalIcon}>
                <ListChecks size={22} color={palette.tertiary} strokeWidth={2} />
              </Surface>
              <View style={{ flex: 1 }}>
                <Text variant="labelSmall" style={styles.approvalLabel}>
                  MENUNGGU APPROVAL ANDA
                </Text>
                <Text variant="titleMedium" style={styles.approvalTitle}>
                  {totalPending} item perlu ditinjau
                </Text>
              </View>
            </View>
            <View style={styles.approvalChips}>
              {data.stats.bimbingan_pending > 0 && (
                <Chip
                  compact
                  icon={() => <ClipboardList size={12} color={palette.warning} strokeWidth={2.4} />}
                  style={styles.approvalChip}
                >
                  {data.stats.bimbingan_pending} Bimbingan
                </Chip>
              )}
              {data.stats.pengajuan_pending > 0 && (
                <Chip
                  compact
                  icon={() => <FileText size={12} color={palette.warning} strokeWidth={2.4} />}
                  style={styles.approvalChip}
                >
                  {data.stats.pengajuan_pending} Pengajuan TA
                </Chip>
              )}
            </View>
          </Card.Content>
        </Card>
      )}

      <SectionTitle title="Ringkasan" />
      <View style={styles.statsRow}>
        <StatCard label="Bimbingan" value={data.stats.total_mahasiswa_bimbingan} Icon={UsersRound} />
        <StatCard label="Pending" value={data.stats.bimbingan_pending} Icon={ListChecks} color={palette.warning} />
        <StatCard label="Pengajuan" value={data.stats.pengajuan_pending} Icon={FileText} color={palette.warning} />
      </View>

      {/* Jadwal menguji - ditonjolkan */}
      {data.jadwal_menguji.length > 0 && (
        <>
          <SectionTitle title="Jadwal Menguji" />
          {data.jadwal_menguji.map((j) => (
            <Card key={j.id} mode="elevated" style={[styles.infoCard, styles.scheduleCard]}>
              <Card.Content>
                <View style={styles.rowBetween}>
                  <Chip
                    compact
                    icon={() => <Clock size={14} color={palette.tertiary} strokeWidth={2.4} />}
                    style={styles.countdownChip}
                    textStyle={styles.countdownText}
                  >
                    {countdownLabel(j.tanggal)}
                  </Chip>
                </View>
                <Text variant="titleMedium" style={styles.cardTitle}>{j.mahasiswa ?? '-'}</Text>
                {j.tanggal && (
                  <Text variant="bodyMedium" style={styles.scheduleDate}>
                    {new Date(j.tanggal).toLocaleDateString('id-ID', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                )}
                {j.waktu && (
                  <View style={styles.scheduleMetaRow}>
                    <Clock size={14} color={palette.onSurfaceVariant} strokeWidth={2} />
                    <Text variant="bodySmall" style={styles.scheduleMeta}>{j.waktu}</Text>
                  </View>
                )}
                {j.ruangan && (
                  <View style={styles.scheduleMetaRow}>
                    <MapPin size={14} color={palette.onSurfaceVariant} strokeWidth={2} />
                    <Text variant="bodySmall" style={styles.scheduleMeta}>{j.ruangan}</Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          ))}
        </>
      )}

      {/* Mahasiswa bimbingan */}
      {data.mahasiswa_bimbingan.length > 0 && (
        <>
          <SectionTitle title="Mahasiswa Bimbingan" />
          {data.mahasiswa_bimbingan.map((mhs) => (
            <Card
              key={mhs.id}
              mode="elevated"
              style={styles.infoCard}
              onPress={() => navigation.navigate('BimbinganDosen')}
            >
              <Card.Content>
                <View style={styles.rowBetween}>
                  <Text variant="titleSmall" style={styles.cardTitle} numberOfLines={1}>
                    {mhs.nama ?? '-'}
                  </Text>
                  <StatusBadge status={mhs.status} />
                </View>
                {mhs.nim && <Text variant="bodySmall" style={styles.meta}>NIM: {mhs.nim}</Text>}
                {mhs.judul && (
                  <Text variant="bodySmall" style={styles.meta} numberOfLines={2}>
                    {mhs.judul}
                  </Text>
                )}
              </Card.Content>
            </Card>
          ))}
        </>
      )}

      <SectionTitle title="Menu Cepat" />
      <View style={styles.menuGrid}>
        <MenuTile label="Bimbingan" Icon={ClipboardCheck} onPress={() => navigation.navigate('BimbinganDosen')} />
        <MenuTile label="Pengajuan TA" Icon={FileText} onPress={() => navigation.navigate('PengajuanDosen')} />
        <MenuTile label="Sempro" Icon={Presentation} onPress={() => navigation.navigate('SemproDosen')} />
        <MenuTile label="Sidang" Icon={GraduationCap} onPress={() => navigation.navigate('SidangDosen')} />
      </View>
    </>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────

function AdminDashboardView({
  data,
  navigation,
}: {
  data: AdminDashboard;
  navigation: Props['navigation'];
}) {
  return (
    <>
      <SectionTitle title="Overview" />
      <View style={styles.statsRow}>
        <StatCard label="Mahasiswa" value={data.stats.total_mahasiswa} Icon={UsersRound} />
        <StatCard label="Dosen" value={data.stats.total_dosen} Icon={GraduationCap} />
      </View>

      <SectionTitle title="Pengajuan TA" />
      <View style={styles.statsRow}>
        <StatCard label="Total" value={data.stats.pengajuan_ta.total} Icon={FileText} />
        <StatCard label="Pending" value={data.stats.pengajuan_ta.pending} Icon={ListChecks} color={palette.warning} />
        <StatCard label="Disetujui" value={data.stats.pengajuan_ta.approved} Icon={ClipboardCheck} color={palette.success} />
      </View>

      <SectionTitle title="Sempro & Sidang" />
      <View style={styles.statsRow}>
        <StatCard label="Sempro" value={data.stats.sempro.total} Icon={Presentation} />
        <StatCard label="Proses" value={data.stats.sempro.on_process} Icon={ListChecks} color={palette.primary} />
      </View>
      <View style={styles.statsRow}>
        <StatCard label="Sidang" value={data.stats.sidang.total} Icon={GraduationCap} />
        <StatCard label="Proses" value={data.stats.sidang.on_process} Icon={ListChecks} color={palette.primary} />
        <StatCard label="Diterima" value={data.stats.sidang.diterima} Icon={ClipboardCheck} color={palette.success} />
      </View>

      <SectionTitle title="Menu Cepat" />
      <View style={styles.menuGrid}>
        <MenuTile label="Kelola User" Icon={UsersRound} onPress={() => navigation.navigate('UserManagement')} />
        <MenuTile label="Periode" Icon={Settings} onPress={() => navigation.navigate('Periode')} />
        <MenuTile label="Jadwal" Icon={Calendar} onPress={() => navigation.navigate('JadwalAdmin')} />
        <MenuTile label="Katalog" Icon={FolderKanban} onPress={() => navigation.navigate('KatalogAdmin')} />
      </View>
    </>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function SectionTitle({ title }: { title: string }) {
  return (
    <Text variant="titleSmall" style={styles.sectionTitle}>
      {title}
    </Text>
  );
}

function StatCard({
  label,
  value,
  Icon,
  color,
}: {
  label: string;
  value: number;
  Icon: LucideIcon;
  color?: string;
}) {
  const tint = color ?? palette.primary;
  return (
    <Card mode="elevated" style={styles.statCard}>
      <Card.Content style={styles.statContent}>
        <Surface elevation={0} style={[styles.statIcon, { backgroundColor: tint + '1A' }]}>
          <Icon size={18} color={tint} strokeWidth={2} />
        </Surface>
        <Text variant="headlineSmall" style={[styles.statValue, { color: tint }]}>
          {value}
        </Text>
        <Text variant="labelSmall" style={styles.statLabel}>
          {label}
        </Text>
      </Card.Content>
    </Card>
  );
}

function MenuTile({
  label,
  Icon,
  onPress,
}: {
  label: string;
  Icon: LucideIcon;
  onPress: () => void;
}) {
  return (
    <Card mode="elevated" style={styles.menuTile}>
      <TouchableRipple
        onPress={onPress}
        rippleColor="rgba(30, 108, 183, 0.12)"
        style={{ borderRadius: 12 }}
      >
        <View style={styles.menuContent}>
          <Surface elevation={0} style={styles.menuIcon}>
            <Icon size={22} color={palette.primary} strokeWidth={1.8} />
          </Surface>
          <Text variant="labelLarge" style={styles.menuLabel}>
            {label}
          </Text>
        </View>
      </TouchableRipple>
    </Card>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },

  welcome: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.primary,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  greeting: { color: 'rgba(255,255,255,0.85)' },
  userName: { color: '#fff', fontWeight: '700', marginTop: 2 },
  roleText: { color: 'rgba(255,255,255,0.85)', marginTop: 4 },

  notifBanner: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: palette.warningContainer,
  },
  notifContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notifIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: { color: '#78350f', fontWeight: '700' },
  notifSub: { color: '#92400e' },

  /* Progress card */
  progressCard: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#fff',
  },
  progressTitle: { color: palette.onSurface, fontWeight: '700' },
  progressChip: {
    backgroundColor: palette.primaryContainer,
    height: 26,
  },
  progressChipText: {
    color: palette.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  progressBar: {
    height: 6,
    borderRadius: 999,
    backgroundColor: palette.surfaceVariant,
    marginTop: 10,
    marginBottom: 16,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepItem: { alignItems: 'center', width: 60 },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceVariant,
  },
  stepIconDone: { backgroundColor: palette.primary },
  stepIconCurrent: {
    backgroundColor: palette.primaryContainer,
    borderWidth: 2,
    borderColor: palette.primary,
  },
  stepIconLocked: { backgroundColor: palette.surfaceVariant, opacity: 0.6 },
  stepLabel: {
    color: palette.onSurfaceVariant,
    marginTop: 6,
    textAlign: 'center',
    fontSize: 10,
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: palette.surfaceVariant,
    marginTop: 17,
    marginHorizontal: -2,
  },
  stepConnectorDone: { backgroundColor: palette.primary },

  /* Next action card */
  nextActionCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#fff',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: palette.onSurfaceVariant,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  actionTitle: { color: palette.onSurface, fontWeight: '700', marginTop: 2 },
  actionDesc: { color: palette.onSurfaceVariant, marginBottom: 12 },
  actionBtn: { borderRadius: 10 },

  /* Approval card (dosen) */
  approvalCard: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: palette.tertiaryContainer,
  },
  approvalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  approvalIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  approvalLabel: {
    color: '#78350f',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  approvalTitle: { color: '#78350f', fontWeight: '700', marginTop: 2 },
  approvalChips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  approvalChip: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    height: 28,
  },

  /* Sections */
  sectionTitle: {
    color: palette.onSurface,
    fontWeight: '700',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 4,
  },
  statCard: { flex: 1, backgroundColor: '#fff' },
  statContent: { alignItems: 'center', paddingVertical: 10, gap: 4 },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: { fontWeight: '800' },
  statLabel: { color: palette.onSurfaceVariant, textAlign: 'center' },

  /* Info cards */
  infoCard: { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#fff' },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    color: palette.onSurfaceVariant,
    letterSpacing: 0.6,
    fontWeight: '700',
  },
  cardTitle: { color: palette.onSurface, fontWeight: '600', flex: 1, marginRight: 8 },
  meta: { color: palette.onSurfaceVariant, marginTop: 4 },

  /* Schedule */
  scheduleCard: { borderLeftWidth: 4, borderLeftColor: palette.tertiary },
  countdownChip: {
    backgroundColor: palette.tertiaryContainer,
    height: 26,
  },
  countdownText: { color: palette.tertiary, fontWeight: '700', fontSize: 11 },
  scheduleType: {
    color: palette.onSurfaceVariant,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  scheduleDate: { color: palette.onSurface, fontWeight: '700', marginTop: 8 },
  scheduleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  scheduleMeta: { color: palette.onSurfaceVariant },

  /* Menu — 2 kolom rapi, pakai space-between supaya gap konsisten */
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    rowGap: 10,
  },
  menuTile: {
    width: '48.5%',
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: palette.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { color: palette.onSurface, fontWeight: '600', flex: 1 },
});
