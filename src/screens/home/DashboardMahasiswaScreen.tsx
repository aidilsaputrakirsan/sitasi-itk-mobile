import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StatusProgressStepper } from '../../components/StatusProgressStepper';
import { StatCard } from '../../components/StatCard';
import { ActionCard } from '../../components/ActionCard';
import { bimbinganService } from '../../services/bimbinganService';
import { COLORS } from '../../utils/constants';

export const DashboardMahasiswaScreen = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [totalBimbingan, setTotalBimbingan] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadStatistics = async () => {
    try {
      const stats = await bimbinganService.getStatistics();
      setTotalBimbingan(stats.total);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStatistics();
    setRefreshing(false);
  };

  // Mock data for status progress (will be from API in Phase 3)
  const pengajuanTASteps = [
    { label: 'Pengajuan', completed: false },
    { label: 'Verifikasi', completed: false },
    { label: 'Approval', completed: false },
    { label: 'Disetujui', completed: false },
  ];

  const semproSteps = [
    { label: 'Pendaftaran', completed: false },
    { label: 'Verifikasi', completed: false },
    { label: 'Jadwal', completed: false },
    { label: 'Pelaksanaan', completed: false },
    { label: 'Lulus', completed: false },
  ];

  const sidangTASteps = [
    { label: 'Pendaftaran', completed: false },
    { label: 'Verifikasi', completed: false },
    { label: 'Jadwal', completed: false },
    { label: 'Pelaksanaan', completed: false },
    { label: 'Selesai', completed: false },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Welcome Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.welcome}>
          Selamat Datang, {user?.name}
        </Text>
        <Text variant="bodyMedium" style={styles.period}>
          Periode Tugas Akhir: Semester Genap 2024/2025
        </Text>
      </View>

      {/* Statistics Card */}
      <StatCard
        title="Total Bimbingan"
        value={totalBimbingan}
        icon="book-open-variant"
        color={COLORS.primary}
      />

      {/* Status Progress Cards */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Status Progress
        </Text>

        <StatusProgressStepper
          title="Status Pengajuan TA"
          icon="file-document"
          steps={pengajuanTASteps}
          currentStep={-1}
        />

        <StatusProgressStepper
          title="Status Seminar Proposal"
          icon="presentation"
          steps={semproSteps}
          currentStep={-1}
        />

        <StatusProgressStepper
          title="Status Sidang TA"
          icon="school"
          steps={sidangTASteps}
          currentStep={-1}
        />
      </View>

      {/* Quick Action Cards */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Menu Cepat
        </Text>

        <View style={styles.actionsGrid}>
          <View style={styles.actionRow}>
            <View style={styles.actionItem}>
              <ActionCard
                title="Bimbingan"
                description="Masukkan hasil bimbingan dengan Dosen Pembimbing"
                icon="book-open"
                color={COLORS.secondary}
                onPress={() => navigation.navigate('Bimbingan')}
              />
            </View>
            <View style={styles.actionItem}>
              <ActionCard
                title="Sempro"
                description="Daftar Seminar Proposal"
                icon="presentation"
                color={COLORS.error}
                onPress={() => {}}
              />
            </View>
          </View>
          <ActionCard
            title="Sidang TA"
            description="Maju ke Sidang Tugas Akhir"
            icon="school"
            color={COLORS.success}
            onPress={() => {}}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  welcome: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  period: {
    opacity: 0.7,
  },
  section: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionsGrid: {
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionItem: {
    flex: 1,
  },
});
