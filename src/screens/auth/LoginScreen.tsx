import React, { useState } from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { Button, Card, HelperText, Surface, Text, TextInput } from 'react-native-paper';
import { AtSign, Eye, EyeOff, Lock, LogIn, ShieldAlert } from 'lucide-react-native';
import sitasiLogo from '../../../assets/logo-sitasi.webp';
import { useAuthStore } from '../../stores/authStore';
import { palette } from '../../theme';

export function LoginScreen() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login: doLogin, isLoading, error, validationErrors, clearError } = useAuthStore();

  const handleLogin = async () => {
    if (!login.trim() || !password.trim()) return;
    await doLogin(login.trim(), password);
  };

  const loginError = validationErrors?.login?.[0];
  const passwordError = validationErrors?.password?.[0];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Hero */}
        <Surface elevation={0} style={styles.hero}>
          <Surface elevation={3} style={styles.logoBadge}>
            <Image source={sitasiLogo} style={styles.logoImage} resizeMode="contain" />
          </Surface>
          <Text variant="headlineMedium" style={styles.title}>
            SITASI ITK
          </Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            Sistem Informasi Tugas Akhir
          </Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            Institut Teknologi Kalimantan
          </Text>
        </Surface>

        {/* Form Card */}
        <Card mode="elevated" style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.formTitle}>
              Masuk ke Akun Anda
            </Text>

            {error && (
              <Surface elevation={0} style={styles.errorBanner}>
                <ShieldAlert size={18} color={palette.error} strokeWidth={2} />
                <Text variant="bodySmall" style={styles.errorText}>
                  {error}
                </Text>
              </Surface>
            )}

            <TextInput
              mode="outlined"
              label="Username atau Email"
              value={login}
              onChangeText={(text) => {
                setLogin(text);
                if (error) clearError();
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!isLoading}
              error={!!loginError}
              left={
                <TextInput.Icon
                  icon={() => <AtSign size={20} color={palette.onSurfaceVariant} strokeWidth={1.8} />}
                />
              }
              style={styles.input}
            />
            <HelperText type="error" visible={!!loginError}>
              {loginError ?? ' '}
            </HelperText>

            <TextInput
              mode="outlined"
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) clearError();
              }}
              secureTextEntry={!showPassword}
              editable={!isLoading}
              error={!!passwordError}
              left={
                <TextInput.Icon
                  icon={() => <Lock size={20} color={palette.onSurfaceVariant} strokeWidth={1.8} />}
                />
              }
              right={
                <TextInput.Icon
                  icon={() =>
                    showPassword ? (
                      <EyeOff size={20} color={palette.onSurfaceVariant} strokeWidth={1.8} />
                    ) : (
                      <Eye size={20} color={palette.onSurfaceVariant} strokeWidth={1.8} />
                    )
                  }
                  onPress={() => setShowPassword((v) => !v)}
                />
              }
              style={styles.input}
            />
            <HelperText type="error" visible={!!passwordError}>
              {passwordError ?? ' '}
            </HelperText>

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading || !login.trim() || !password.trim()}
              icon={({ size, color }) => <LogIn size={size} color={color} strokeWidth={2} />}
              contentStyle={styles.loginBtnContent}
              style={styles.loginBtn}
            >
              Masuk
            </Button>
          </Card.Content>
        </Card>

        <Text variant="labelSmall" style={styles.footer}>
          © {new Date().getFullYear()} Institut Teknologi Kalimantan
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingVertical: 40 },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 12,
  },
  logoImage: { width: '100%', height: '100%' },
  title: {
    color: palette.primaryDark,
    fontWeight: '800',
    letterSpacing: 2,
  },
  subtitle: {
    color: palette.onSurfaceVariant,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  cardContent: { paddingVertical: 16 },
  formTitle: {
    color: palette.onSurface,
    fontWeight: '700',
    marginBottom: 16,
  },
  input: { backgroundColor: '#fff' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: palette.errorContainer,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorText: { color: palette.onErrorContainer, flex: 1 },
  loginBtn: { marginTop: 8, borderRadius: 12 },
  loginBtnContent: { paddingVertical: 8 },
  footer: {
    textAlign: 'center',
    color: palette.onSurfaceVariant,
    marginTop: 24,
  },
});
