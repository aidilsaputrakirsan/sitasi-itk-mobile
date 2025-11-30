import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardMahasiswaScreen } from './DashboardMahasiswaScreen';
import { DashboardDosenScreen } from './DashboardDosenScreen';

export const HomeScreen = () => {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Show different dashboard based on user role
  if (user.is_mahasiswa) {
    return <DashboardMahasiswaScreen />;
  }

  if (user.is_dosen) {
    return <DashboardDosenScreen />;
  }

  // Fallback
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Welcome, {user.name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
