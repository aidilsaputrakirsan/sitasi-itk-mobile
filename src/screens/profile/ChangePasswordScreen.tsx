import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Appbar, Snackbar, useTheme, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../../services/authService';

export const ChangePasswordScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword) {
      setError('Password saat ini wajib diisi');
      setSnackbarVisible(true);
      return;
    }

    if (!newPassword) {
      setError('Password baru wajib diisi');
      setSnackbarVisible(true);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password baru minimal 8 karakter');
      setSnackbarVisible(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      setSuccess(true);
      setError('Password berhasil diubah');
      setSnackbarVisible(true);

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (err: any) {
      console.error('Change password error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Gagal mengubah password';
      setError(errorMessage);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Ganti Password" />
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text variant="bodyMedium" style={styles.hint}>
            Password baru harus minimal 8 karakter
          </Text>

          <TextInput
            label="Password Saat Ini"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            mode="outlined"
            secureTextEntry={!showCurrentPassword}
            right={
              <TextInput.Icon
                icon={showCurrentPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              />
            }
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="Password Baru"
            value={newPassword}
            onChangeText={setNewPassword}
            mode="outlined"
            secureTextEntry={!showNewPassword}
            right={
              <TextInput.Icon
                icon={showNewPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowNewPassword(!showNewPassword)}
              />
            }
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="Konfirmasi Password Baru"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry={!showConfirmPassword}
            right={
              <TextInput.Icon
                icon={showConfirmPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
            style={styles.input}
            disabled={loading}
          />

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.button}
              disabled={loading}
            >
              Batal
            </Button>

            <Button
              mode="contained"
              onPress={handleChangePassword}
              style={styles.button}
              loading={loading}
              disabled={loading}
            >
              Simpan
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={success ? 1500 : 4000}
        style={{ backgroundColor: success ? theme.colors.primary : theme.colors.error }}
      >
        {error}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  hint: {
    marginBottom: 16,
    opacity: 0.7,
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
});
