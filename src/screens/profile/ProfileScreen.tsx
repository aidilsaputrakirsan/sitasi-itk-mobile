import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Avatar,
  Card,
  Text,
  Button,
  Switch,
  Chip,
  Dialog,
  Portal,
  useTheme,
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';

export const ProfileScreen = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useAppTheme();
  const navigation = useNavigation<any>();
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  const handleLogout = async () => {
    setLogoutDialogVisible(false);
    await logout();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = () => {
    if (user?.is_mahasiswa) return theme.colors.primary;
    if (user?.is_dosen) return theme.colors.secondary;
    return theme.colors.tertiary;
  };

  const getRoleLabel = () => {
    if (user?.is_mahasiswa) return 'Mahasiswa';
    if (user?.is_dosen) return 'Dosen';
    return 'User';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text
            size={80}
            label={getInitials(user?.name || 'U')}
            style={{ backgroundColor: getRoleBadgeColor() }}
          />
          <Text variant="headlineSmall" style={styles.name}>
            {user?.name}
          </Text>
          <Text variant="bodyMedium" style={styles.email}>
            {user?.email}
          </Text>
          <Chip
            mode="flat"
            style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor() }]}
            textStyle={{ color: '#fff' }}
          >
            {getRoleLabel()}
          </Chip>
        </Card.Content>
      </Card>

      {/* User Info Card */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Informasi Pribadi
          </Text>

          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>
              Username:
            </Text>
            <Text variant="bodyMedium" style={styles.value}>
              {user?.username}
            </Text>
          </View>

          {user?.is_mahasiswa && user?.mahasiswa && (
            <>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  NIM:
                </Text>
                <Text variant="bodyMedium" style={styles.value}>
                  {user.mahasiswa.nim}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Prodi:
                </Text>
                <Text variant="bodyMedium" style={styles.value}>
                  {user.mahasiswa.prodi}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Angkatan:
                </Text>
                <Text variant="bodyMedium" style={styles.value}>
                  {user.mahasiswa.angkatan}
                </Text>
              </View>
            </>
          )}

          {user?.is_dosen && user?.dosen && (
            <>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  NIP:
                </Text>
                <Text variant="bodyMedium" style={styles.value}>
                  {user.dosen.nip}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Prodi:
                </Text>
                <Text variant="bodyMedium" style={styles.value}>
                  {user.dosen.prodi}
                </Text>
              </View>
            </>
          )}

          {user?.telpon && (
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Telepon:
              </Text>
              <Text variant="bodyMedium" style={styles.value}>
                {user.telpon}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Actions Card */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Pengaturan
          </Text>

          <Button
            mode="outlined"
            icon="account-edit"
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.actionButton}
          >
            Edit Profil
          </Button>

          <Button
            mode="outlined"
            icon="lock-reset"
            onPress={() => navigation.navigate('ChangePassword')}
            style={styles.actionButton}
          >
            Ganti Password
          </Button>

          <View style={styles.themeRow}>
            <Text variant="bodyLarge">Dark Mode</Text>
            <Switch value={isDarkMode} onValueChange={toggleTheme} />
          </View>

          <Button
            mode="contained"
            icon="logout"
            onPress={() => setLogoutDialogVisible(true)}
            style={styles.logoutButton}
            buttonColor={theme.colors.error}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>

      {/* Logout Confirmation Dialog */}
      <Portal>
        <Dialog visible={logoutDialogVisible} onDismiss={() => setLogoutDialogVisible(false)}>
          <Dialog.Title>Konfirmasi Logout</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Anda yakin ingin keluar dari aplikasi?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)}>Batal</Button>
            <Button onPress={handleLogout} textColor={theme.colors.error}>
              Logout
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  name: {
    fontWeight: 'bold',
    marginTop: 16,
  },
  email: {
    marginTop: 4,
    opacity: 0.7,
  },
  roleBadge: {
    marginTop: 12,
  },
  infoCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  label: {
    fontWeight: '500',
  },
  value: {
    opacity: 0.8,
  },
  actionsCard: {
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 12,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  logoutButton: {
    marginTop: 8,
  },
});
