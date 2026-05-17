import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { GraduationCap } from 'lucide-react-native';
import { RegistrationInfo } from '../../components/ui/RegistrationInfo';
import { TabHeader } from '../../components/ui/TabHeader';
import { palette } from '../../theme';

/**
 * Tab Akademik mahasiswa — info card Sempro & Sidang TA.
 * Pendaftaran dilakukan via peramban (web), mobile hanya tampilkan informasi
 * dan status (status terpantau via Dasbor — Progress TA).
 */
export function AkademikScreen() {
  return (
    <View style={styles.root}>
      <TabHeader title="Akademik" subtitle="Sempro & Sidang TA" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header banner */}
        <Surface elevation={0} style={styles.banner}>
          <Surface elevation={0} style={styles.bannerIcon}>
            <GraduationCap size={22} color="#fff" strokeWidth={2} />
          </Surface>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={styles.bannerTitle}>
              Pendaftaran Akademik
            </Text>
            <Text variant="bodySmall" style={styles.bannerSub}>
              Pendaftaran Sempro & Sidang TA dilakukan melalui peramban pada laptop/komputer untuk memastikan kelengkapan berkas.
            </Text>
          </View>
        </Surface>

        <RegistrationInfo type="sempro" />
        <RegistrationInfo type="sidang" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  scroll: { paddingVertical: 12, paddingBottom: 32 },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 16,
    marginBottom: 4,
    padding: 16,
    backgroundColor: palette.primary,
    borderRadius: 14,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: { color: '#fff', fontWeight: '700' },
  bannerSub: { color: 'rgba(255,255,255,0.9)', marginTop: 2, lineHeight: 18 },
});
