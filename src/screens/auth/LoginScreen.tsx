import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';

export function LoginScreen() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const { login: doLogin, isLoading, error, validationErrors, clearError } = useAuthStore();

  const handleLogin = async () => {
    if (!login.trim() || !password.trim()) return;
    await doLogin(login.trim(), password);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>SITASI ITK</Text>
          <Text style={styles.subtitle}>Sistem Informasi Tugas Akhir</Text>
          <Text style={styles.subtitle}>Institut Teknologi Kalimantan</Text>
        </View>

        <View style={styles.form}>
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.label}>Username atau Email</Text>
          <TextInput
            style={[styles.input, validationErrors?.login && styles.inputError]}
            value={login}
            onChangeText={(text) => {
              setLogin(text);
              if (error) clearError();
            }}
            placeholder="Masukkan username atau email"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!isLoading}
          />
          {validationErrors?.login?.map((msg, i) => (
            <Text key={i} style={styles.fieldError}>{msg}</Text>
          ))}

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, validationErrors?.password && styles.inputError]}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (error) clearError();
            }}
            placeholder="Masukkan password"
            secureTextEntry
            editable={!isLoading}
          />
          {validationErrors?.password?.map((msg, i) => (
            <Text key={i} style={styles.fieldError}>{msg}</Text>
          ))}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Masuk</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0066CC',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputError: {
    borderColor: '#CC0000',
  },
  button: {
    backgroundColor: '#0066CC',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#CC0000',
  },
  errorText: {
    color: '#CC0000',
    fontSize: 13,
  },
  fieldError: {
    color: '#CC0000',
    fontSize: 12,
    marginTop: 4,
  },
});
