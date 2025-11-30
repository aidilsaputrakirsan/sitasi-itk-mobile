import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { ActionCard } from '../../components/ActionCard';
import { COLORS } from '../../utils/constants';

export const DashboardDosenScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.welcome}>
          Selamat Datang, {user?.name}
        </Text>
        <Text variant="bodyMedium" style={styles.period}>
          Periode Tugas Akhir: Semester Genap 2024/2025
        </Text>
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
                description="Lihat bimbingan mahasiswa"
                icon="book-open"
                color={COLORS.secondary}
                onPress={() => navigation.navigate('Bimbingan')}
              />
            </View>
            <View style={styles.actionItem}>
              <ActionCard
                title="Sempro"
                description="Jadwal Seminar Proposal"
                icon="presentation"
                color={COLORS.error}
                onPress={() => {}}
              />
            </View>
          </View>
          <ActionCard
            title="Sidang TA"
            description="Jadwal Sidang Tugas Akhir"
            icon="school"
            color={COLORS.success}
            onPress={() => {}}
          />
        </View>
      </View>

      {/* Note for future features */}
      <View style={styles.note}>
        <Text variant="bodySmall" style={styles.noteText}>
          Fitur statistik dan jadwal akan tersedia segera.
        </Text>
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
  note: {
    marginTop: 32,
    padding: 16,
    alignItems: 'center',
  },
  noteText: {
    opacity: 0.6,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
