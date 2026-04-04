import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/authStore';

// Auth
import { LoginScreen } from '../screens/auth/LoginScreen';

// Tab navigators
import { MahasiswaNavigator } from './MahasiswaNavigator';
import { DosenNavigator } from './DosenNavigator';
import { AdminNavigator } from './AdminNavigator';

// Common screens (stacks on top of tabs)
import { NotifikasiScreen } from '../screens/common/NotifikasiScreen';
import { KatalogScreen } from '../screens/common/KatalogScreen';
import { KatalogDetailScreen } from '../screens/common/KatalogDetailScreen';
import { JadwalScreen } from '../screens/common/JadwalScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';

// Mahasiswa screens
import { BimbinganScreen } from '../screens/mahasiswa/BimbinganScreen';
import { BimbinganDetailScreen } from '../screens/mahasiswa/BimbinganDetailScreen';
import { BimbinganFormScreen } from '../screens/mahasiswa/BimbinganFormScreen';
import { PengajuanTAScreen } from '../screens/mahasiswa/PengajuanTAScreen';
import { PengajuanTADetailScreen } from '../screens/mahasiswa/PengajuanTADetailScreen';
import { PengajuanTAFormScreen } from '../screens/mahasiswa/PengajuanTAFormScreen';
import { SemproScreen } from '../screens/mahasiswa/SemproScreen';
import { SidangScreen } from '../screens/mahasiswa/SidangScreen';

// Dosen screens
import { BimbinganDosenScreen } from '../screens/dosen/BimbinganDosenScreen';
import { PengajuanDosenScreen } from '../screens/dosen/PengajuanDosenScreen';
import { SemproDosenScreen } from '../screens/dosen/SemproDosenScreen';
import { SidangDosenScreen } from '../screens/dosen/SidangDosenScreen';

// Admin screens
import { UserManagementScreen } from '../screens/admin/UserManagementScreen';
import { PeriodeScreen } from '../screens/admin/PeriodeScreen';
import { JadwalAdminScreen } from '../screens/admin/JadwalAdminScreen';
import { KatalogAdminScreen } from '../screens/admin/KatalogAdminScreen';

import { LoadingScreen } from '../components/ui/LoadingScreen';

const Stack = createNativeStackNavigator();

function MainTabs() {
  const getPrimaryRole = useAuthStore((s) => s.getPrimaryRole);
  const role = getPrimaryRole();

  switch (role) {
    case 'dosen':
      return <DosenNavigator />;
    case 'tendik':
    case 'koorpro':
      return <AdminNavigator />;
    case 'mahasiswa':
    default:
      return <MahasiswaNavigator />;
  }
}

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <LoadingScreen />;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0066CC' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
        headerBackTitle: 'Kembali',
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />

          {/* Common */}
          <Stack.Screen name="Notifikasi" component={NotifikasiScreen} options={{ title: 'Notifikasi' }} />
          <Stack.Screen name="Katalog" component={KatalogScreen} options={{ title: 'Katalog TA' }} />
          <Stack.Screen name="KatalogDetail" component={KatalogDetailScreen} options={{ title: 'Detail Katalog' }} />
          <Stack.Screen name="Jadwal" component={JadwalScreen} options={{ title: 'Jadwal Saya' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />

          {/* Mahasiswa */}
          <Stack.Screen name="Bimbingan" component={BimbinganScreen} options={{ title: 'Bimbingan' }} />
          <Stack.Screen name="BimbinganDetail" component={BimbinganDetailScreen} options={{ title: 'Detail Bimbingan' }} />
          <Stack.Screen name="BimbinganForm" component={BimbinganFormScreen} options={{ title: 'Form Bimbingan' }} />
          <Stack.Screen name="PengajuanTA" component={PengajuanTAScreen} options={{ title: 'Pengajuan TA' }} />
          <Stack.Screen name="PengajuanTADetail" component={PengajuanTADetailScreen} options={{ title: 'Detail Pengajuan' }} />
          <Stack.Screen name="PengajuanTAForm" component={PengajuanTAFormScreen} options={{ title: 'Form Pengajuan TA' }} />
          <Stack.Screen name="Sempro" component={SemproScreen} options={{ title: 'Seminar Proposal' }} />
          <Stack.Screen name="Sidang" component={SidangScreen} options={{ title: 'Sidang TA' }} />

          {/* Dosen */}
          <Stack.Screen name="BimbinganDosen" component={BimbinganDosenScreen} options={{ title: 'Bimbingan Mahasiswa' }} />
          <Stack.Screen name="PengajuanDosen" component={PengajuanDosenScreen} options={{ title: 'Pengajuan TA' }} />
          <Stack.Screen name="SemproDosen" component={SemproDosenScreen} options={{ title: 'Sempro' }} />
          <Stack.Screen name="SidangDosen" component={SidangDosenScreen} options={{ title: 'Sidang' }} />

          {/* Admin */}
          <Stack.Screen name="UserManagement" component={UserManagementScreen} options={{ title: 'Kelola User' }} />
          <Stack.Screen name="Periode" component={PeriodeScreen} options={{ title: 'Periode' }} />
          <Stack.Screen name="JadwalAdmin" component={JadwalAdminScreen} options={{ title: 'Kelola Jadwal' }} />
          <Stack.Screen name="KatalogAdmin" component={KatalogAdminScreen} options={{ title: 'Kelola Katalog' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
