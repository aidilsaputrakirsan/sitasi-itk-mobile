import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Divider,
  Surface,
  Text,
  TextInput,
  Snackbar,
  ActivityIndicator,
  Dialog,
  Portal,
} from 'react-native-paper';
import {
  AtSign,
  BookOpen,
  Camera,
  Eye,
  EyeOff,
  GraduationCap,
  IdCard,
  Key,
  LogOut,
  Mail,
  Phone,
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useAuthStore } from '../../stores/authStore';
import { usersApi } from '../../api/endpoints/users';
import { authApi } from '../../api/endpoints/auth';
import { palette } from '../../theme';
import { getUserDisplayName, getUserIdentifier, getUserRoleLabel } from '../../utils/userDisplay';

type SnackState = { visible: boolean; message: string; variant: 'success' | 'error' };

export function ProfileScreen() {
  const { user, refreshUser, logout } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [snack, setSnack] = useState<SnackState>({ visible: false, message: '', variant: 'success' });

  const showSnack = (message: string, variant: 'success' | 'error') =>
    setSnack({ visible: true, message, variant });

  const handleUploadPhoto = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['image/jpeg', 'image/png'] });
      if (result.canceled) return;

      setUploading(true);
      const file = result.assets[0];
      const formData = new FormData();
      formData.append('photo', {
        uri: file.uri,
        type: file.mimeType ?? 'image/jpeg',
        name: file.name ?? 'photo.jpg',
      } as unknown as Blob);

      await usersApi.updateProfile(formData);
      await refreshUser();
      showSnack('Foto profil berhasil diperbarui', 'success');
    } catch (err: unknown) {
      showSnack((err as { message?: string }).message ?? 'Gagal upload foto', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showSnack('Semua field harus diisi', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showSnack('Password baru tidak cocok', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      await authApi.changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      showSnack('Password berhasil diubah', 'success');
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const error = err as { message?: string; errors?: Record<string, string[]> };
      const msgs = error.errors
        ? Object.values(error.errors).flat().join('\n')
        : error.message ?? 'Gagal mengubah password';
      showSnack(msgs, 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  if (!user) return null;

  const displayName = getUserDisplayName(user);
  const identifier = getUserIdentifier(user);
  const roleLabel = getUserRoleLabel(user.roles);
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase())
    .join('');

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header dengan gradient warna primary */}
        <Surface elevation={0} style={styles.header}>
          <Pressable onPress={handleUploadPhoto} disabled={uploading} style={styles.avatarWrap}>
            {user.photo ? (
              <Avatar.Image size={96} source={{ uri: user.photo }} />
            ) : (
              <Avatar.Text
                size={96}
                label={initials || '?'}
                style={{ backgroundColor: palette.primaryDark }}
                color="#fff"
              />
            )}
            <View style={styles.cameraBadge}>
              {uploading ? (
                <ActivityIndicator size={14} color="#fff" />
              ) : (
                <Camera size={14} color="#fff" strokeWidth={2.4} />
              )}
            </View>
          </Pressable>

          <Text variant="headlineSmall" style={styles.name}>
            {displayName}
          </Text>
          <Surface elevation={0} style={styles.roleChip}>
            <Text variant="labelSmall" style={styles.roleText}>
              {roleLabel}
            </Text>
          </Surface>
          {identifier !== '-' && (
            <Text variant="bodySmall" style={styles.identifier}>
              {identifier}
            </Text>
          )}
        </Surface>

        {/* Info section */}
        <Card mode="elevated" style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Informasi Akun
            </Text>
            <InfoRow Icon={AtSign} label="Username" value={user.username} />
            <Divider />
            <InfoRow Icon={Mail} label="Email" value={user.email} />
            {(user.mahasiswa?.nim || user.nim) && (
              <>
                <Divider />
                <InfoRow Icon={IdCard} label="NIM" value={user.mahasiswa?.nim ?? user.nim ?? '-'} />
              </>
            )}
            {(user.dosen?.nip || user.nip) && (
              <>
                <Divider />
                <InfoRow Icon={IdCard} label="NIP" value={user.dosen?.nip ?? user.nip ?? '-'} />
              </>
            )}
            {(user.mahasiswa?.nomor_telepon || user.telpon) && (
              <>
                <Divider />
                <InfoRow
                  Icon={Phone}
                  label="Telepon"
                  value={user.mahasiswa?.nomor_telepon ?? user.telpon ?? '-'}
                />
              </>
            )}
            {user.dosen?.prodi && (
              <>
                <Divider />
                <InfoRow Icon={GraduationCap} label="Prodi" value={user.dosen.prodi} />
              </>
            )}
            {user.judul_ta && (
              <>
                <Divider />
                <InfoRow Icon={BookOpen} label="Judul TA" value={user.judul_ta} />
              </>
            )}
          </Card.Content>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            mode="contained-tonal"
            icon={({ size, color }) => <Key size={size} color={color} strokeWidth={2} />}
            onPress={() => setShowChangePassword((v) => !v)}
            style={styles.actionBtn}
            contentStyle={styles.actionBtnContent}
          >
            {showChangePassword ? 'Tutup Ubah Password' : 'Ubah Password'}
          </Button>

          {showChangePassword && (
            <Card mode="outlined" style={styles.formCard}>
              <Card.Content>
                <TextInput
                  mode="outlined"
                  label="Password saat ini"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrent}
                  right={
                    <TextInput.Icon
                      icon={() =>
                        showCurrent ? (
                          <EyeOff size={20} color={palette.onSurfaceVariant} />
                        ) : (
                          <Eye size={20} color={palette.onSurfaceVariant} />
                        )
                      }
                      onPress={() => setShowCurrent((v) => !v)}
                    />
                  }
                  style={styles.input}
                />
                <TextInput
                  mode="outlined"
                  label="Password baru"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNew}
                  right={
                    <TextInput.Icon
                      icon={() =>
                        showNew ? (
                          <EyeOff size={20} color={palette.onSurfaceVariant} />
                        ) : (
                          <Eye size={20} color={palette.onSurfaceVariant} />
                        )
                      }
                      onPress={() => setShowNew((v) => !v)}
                    />
                  }
                  style={styles.input}
                />
                <TextInput
                  mode="outlined"
                  label="Konfirmasi password baru"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                  right={
                    <TextInput.Icon
                      icon={() =>
                        showConfirm ? (
                          <EyeOff size={20} color={palette.onSurfaceVariant} />
                        ) : (
                          <Eye size={20} color={palette.onSurfaceVariant} />
                        )
                      }
                      onPress={() => setShowConfirm((v) => !v)}
                    />
                  }
                  style={styles.input}
                />
                <Button
                  mode="contained"
                  onPress={handleChangePassword}
                  loading={changingPassword}
                  disabled={changingPassword}
                  style={{ marginTop: 8 }}
                  contentStyle={styles.actionBtnContent}
                >
                  Simpan Password
                </Button>
              </Card.Content>
            </Card>
          )}

          <Button
            mode="outlined"
            icon={({ size, color }) => <LogOut size={size} color={color} strokeWidth={2} />}
            onPress={() => setShowLogoutDialog(true)}
            style={[styles.actionBtn, styles.logoutBtn]}
            contentStyle={styles.actionBtnContent}
            textColor={palette.error}
          >
            Keluar
          </Button>
        </View>
      </ScrollView>

      <Portal>
        <Dialog visible={showLogoutDialog} onDismiss={() => setShowLogoutDialog(false)}>
          <Dialog.Title>Keluar dari akun?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Anda akan keluar dari aplikasi dan perlu login kembali untuk mengakses fitur.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLogoutDialog(false)}>Batal</Button>
            <Button
              onPress={() => {
                setShowLogoutDialog(false);
                logout();
              }}
              textColor={palette.error}
            >
              Keluar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snack.visible}
        onDismiss={() => setSnack((s) => ({ ...s, visible: false }))}
        duration={3000}
        style={{
          backgroundColor: snack.variant === 'success' ? palette.success : palette.error,
        }}
      >
        {snack.message}
      </Snackbar>
    </View>
  );
}

function InfoRow({
  Icon,
  label,
  value,
}: {
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Icon size={18} color={palette.primary} strokeWidth={1.8} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="labelSmall" style={styles.infoLabel}>
          {label}
        </Text>
        <Text variant="bodyMedium" style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  scroll: { paddingBottom: 32 },
  header: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 24,
    backgroundColor: palette.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarWrap: { position: 'relative' },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: palette.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: { color: '#fff', marginTop: 14, fontWeight: '700' },
  roleChip: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  roleText: { color: '#fff', letterSpacing: 1.2, fontWeight: '700' },
  identifier: { color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  card: { marginHorizontal: 16, marginTop: -16, backgroundColor: '#fff' },
  cardContent: { paddingVertical: 4 },
  sectionTitle: {
    color: palette.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: palette.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: { color: palette.onSurfaceVariant, letterSpacing: 0.4 },
  infoValue: { color: palette.onSurface, fontWeight: '500', marginTop: 2 },
  actions: { paddingHorizontal: 16, marginTop: 16, gap: 10 },
  actionBtn: { borderRadius: 12 },
  actionBtnContent: { paddingVertical: 6 },
  formCard: { marginTop: 4, backgroundColor: '#fff', borderColor: palette.outlineVariant },
  input: { backgroundColor: '#fff', marginBottom: 10 },
  logoutBtn: { borderColor: palette.errorContainer, marginTop: 8 },
});
