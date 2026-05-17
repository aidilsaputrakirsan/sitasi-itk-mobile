import React, { useState } from 'react';
import { View, StyleSheet, Linking, Alert } from 'react-native';
import { Button, Card, Surface, Text } from 'react-native-paper';
import {
  CircleAlert,
  ExternalLink,
  FileCheck2,
  FileText,
  Info,
  LaptopMinimal,
  Sparkles,
} from 'lucide-react-native';
import config from '../../config/env';
import { palette } from '../../theme';

interface Props {
  /** Tipe pendaftaran — sempro atau sidang */
  type: 'sempro' | 'sidang';
  /** Path web tujuan (mis. "/ta/sempro") */
  webPath?: string;
}

interface SectionConfig {
  title: string;
  subtitle: string;
  description: string;
  bentukTaNote: string;
  /** Berkas yang disediakan/digenerate otomatis oleh sistem */
  systemFiles: string[];
  /** Berkas yang wajib disiapkan & diunggah oleh mahasiswa */
  userFiles: string[];
  accentColor: string;
  webPath: string;
}

const CONFIG: Record<'sempro' | 'sidang', SectionConfig> = {
  sempro: {
    title: 'Seminar Proposal',
    subtitle: 'Pendaftaran Sempro',
    description:
      'Pendaftaran Seminar Proposal melibatkan unggah berkas PDF yang membutuhkan layar dan jaringan yang stabil. Untuk memastikan kelengkapan dan keamanan berkas, mohon lakukan pendaftaran melalui peramban (browser) pada laptop atau komputer Anda.',
    bentukTaNote:
      'Bentuk Tugas Akhir (Skripsi, Proyek, atau Prototipe TKT-5) ditentukan oleh Pembimbing 1 pada tahap pengajuan.',
    systemFiles: [
      'Form TA-01A — Formulir Kesediaan Membimbing',
      'Form TA-02 — Formulir Persetujuan Seminar Proposal',
      'Form TA-04 — Lembar Monitoring Bimbingan',
      'Form TA-03D — Lembar Bukti Kehadiran Seminar Proposal',
    ],
    userFiles: [
      'Berkas Proposal Tugas Akhir (PDF)',
      'Bukti Plagiasi (Turnitin) — PDF',
    ],
    accentColor: palette.primary,
    webPath: '/ta/sempro',
  },
  sidang: {
    title: 'Sidang Tugas Akhir',
    subtitle: 'Pendaftaran Sidang TA',
    description:
      'Pendaftaran Sidang Tugas Akhir membutuhkan unggah berkas PDF berukuran besar. Demi kelancaran proses, mohon lakukan pendaftaran melalui peramban (browser) pada laptop atau komputer Anda.',
    bentukTaNote:
      'Pastikan revisi Seminar Proposal telah disetujui oleh seluruh Pembimbing dan Penguji sebelum mendaftar Sidang TA.',
    systemFiles: [
      'Lembar Persetujuan Revisi Proposal TA',
      'Form TA-04 — Lembar Monitoring Bimbingan',
      'Form TA-05 — Formulir Persetujuan Sidang TA',
      'Form TA-008 — Formulir Permohonan Sidang TA',
    ],
    userFiles: [
      'Berkas Draft Tugas Akhir (PDF)',
      'Bukti Plagiasi (Turnitin) — PDF',
    ],
    accentColor: palette.tertiary,
    webPath: '/ta/sidang-ta',
  },
};

export function RegistrationInfo({ type, webPath }: Props) {
  const cfg = CONFIG[type];
  const fullWebPath = webPath ?? cfg.webPath;
  const targetUrl = `${config.WEB_BASE_URL}${fullWebPath}`;
  const [opening, setOpening] = useState(false);

  const handleOpenBrowser = async () => {
    try {
      setOpening(true);
      const supported = await Linking.canOpenURL(targetUrl);
      if (supported) {
        await Linking.openURL(targetUrl);
      } else {
        Alert.alert(
          'Tidak Dapat Membuka',
          `Silakan buka link berikut di peramban:\n\n${targetUrl}`
        );
      }
    } catch {
      Alert.alert(
        'Gagal Membuka',
        `Silakan buka link berikut di peramban:\n\n${targetUrl}`
      );
    } finally {
      setOpening(false);
    }
  };

  return (
    <Card mode="elevated" style={styles.card}>
      <Card.Content style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Surface
            elevation={0}
            style={[styles.iconBox, { backgroundColor: cfg.accentColor + '1A' }]}
          >
            <LaptopMinimal size={22} color={cfg.accentColor} strokeWidth={1.8} />
          </Surface>
          <View style={{ flex: 1 }}>
            <Text variant="labelSmall" style={styles.subtitle}>
              {cfg.subtitle.toUpperCase()}
            </Text>
            <Text variant="titleMedium" style={styles.title}>
              {cfg.title}
            </Text>
          </View>
        </View>

        {/* Info banner */}
        <Surface elevation={0} style={styles.infoBanner}>
          <Info size={16} color={palette.primary} strokeWidth={2} />
          <Text variant="bodySmall" style={styles.infoText}>
            {cfg.description}
          </Text>
        </Surface>

        {/* Bentuk TA note */}
        <Surface elevation={0} style={styles.bentukBanner}>
          <Sparkles size={16} color={palette.tertiary} strokeWidth={2} />
          <Text variant="bodySmall" style={styles.bentukText}>
            {cfg.bentukTaNote}
          </Text>
        </Surface>

        {/* Berkas Sistem */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <FileCheck2 size={16} color={palette.success} strokeWidth={2} />
            <Text variant="labelLarge" style={styles.sectionLabel}>
              Berkas Disediakan Sistem
            </Text>
          </View>
          <Text variant="labelSmall" style={styles.sectionHint}>
            Berkas berikut akan otomatis tersedia di akun Anda saat membuka halaman pendaftaran.
          </Text>
          {cfg.systemFiles.map((doc, i) => (
            <FileItem key={`sys-${i}`} text={doc} variant="system" index={i + 1} />
          ))}
        </View>

        {/* Berkas Mahasiswa */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <CircleAlert size={16} color={palette.warning} strokeWidth={2} />
            <Text variant="labelLarge" style={styles.sectionLabel}>
              Berkas yang Perlu Anda Siapkan
            </Text>
          </View>
          <Text variant="labelSmall" style={styles.sectionHint}>
            Mohon siapkan berkas berikut dalam format PDF sebelum mendaftar:
          </Text>
          {cfg.userFiles.map((doc, i) => (
            <FileItem key={`usr-${i}`} text={doc} variant="user" index={i + 1} />
          ))}
        </View>

        {/* Langkah */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={styles.sectionLabel}>
            Langkah Pendaftaran
          </Text>
          <StepItem
            number="1"
            text="Buka tautan SITASI di peramban laptop atau komputer Anda."
          />
          <StepItem
            number="2"
            text="Masuk dengan akun yang sama seperti pada aplikasi ini."
          />
          <StepItem
            number="3"
            text={`Pilih menu ${cfg.title} pada halaman dasbor.`}
          />
          <StepItem
            number="4"
            text="Unggah berkas yang diperlukan dan kirim pendaftaran."
          />
        </View>

        {/* CTA Button */}
        <Button
          mode="contained"
          onPress={handleOpenBrowser}
          loading={opening}
          disabled={opening}
          icon={({ size, color }) => (
            <ExternalLink size={size} color={color} strokeWidth={2} />
          )}
          contentStyle={[styles.btnContent, { flexDirection: 'row-reverse' }]}
          style={[styles.btn, { backgroundColor: cfg.accentColor }]}
        >
          Buka SITASI di Browser
        </Button>

        <Text variant="labelSmall" style={styles.helperText}>
          Setelah pendaftaran berhasil, status dapat dipantau melalui Dasbor di aplikasi ini.
        </Text>
      </Card.Content>
    </Card>
  );
}

function FileItem({
  text,
  variant,
  index,
}: {
  text: string;
  variant: 'system' | 'user';
  index: number;
}) {
  const tint = variant === 'system' ? palette.success : palette.warning;
  const bgTint = variant === 'system' ? palette.successContainer : palette.warningContainer;
  return (
    <View style={styles.docRow}>
      <Surface elevation={0} style={[styles.docBadge, { backgroundColor: bgTint }]}>
        <FileText size={14} color={tint} strokeWidth={2} />
      </Surface>
      <Text variant="bodyMedium" style={styles.docText}>
        <Text style={styles.docIndex}>{`${index}. `}</Text>
        {text}
      </Text>
    </View>
  );
}

function StepItem({ number, text }: { number: string; text: string }) {
  return (
    <View style={styles.stepRow}>
      <Surface elevation={0} style={styles.stepNum}>
        <Text variant="labelMedium" style={styles.stepNumText}>
          {number}
        </Text>
      </Surface>
      <Text variant="bodyMedium" style={styles.stepText}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginVertical: 8, backgroundColor: '#fff' },
  content: { paddingVertical: 16 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: { color: palette.onSurfaceVariant, letterSpacing: 0.6, fontWeight: '700' },
  title: { color: palette.onSurface, fontWeight: '700', marginTop: 2 },

  infoBanner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: palette.primaryContainer,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  infoText: { color: palette.onSurface, flex: 1, lineHeight: 19 },

  bentukBanner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: palette.tertiaryContainer,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  bentukText: { color: '#78350f', flex: 1, lineHeight: 19, fontWeight: '500' },

  section: { marginBottom: 16 },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sectionLabel: {
    color: palette.onSurface,
    fontWeight: '700',
  },
  sectionHint: {
    color: palette.onSurfaceVariant,
    marginBottom: 10,
    lineHeight: 16,
  },

  docRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 6,
  },
  docBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  docText: { color: palette.onSurface, flex: 1, lineHeight: 20 },
  docIndex: { color: palette.onSurfaceVariant, fontWeight: '700' },

  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 6,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  stepText: { color: palette.onSurface, flex: 1, lineHeight: 20 },

  btn: { borderRadius: 12, marginTop: 4 },
  btnContent: { paddingVertical: 6 },

  helperText: {
    color: palette.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});
