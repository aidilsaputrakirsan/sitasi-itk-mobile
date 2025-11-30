import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Appbar, Snackbar, useTheme, Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { bimbinganService } from '../../services/bimbinganService';
import { formatDateForApi } from '../../utils/dateFormatter';
import { DatePickerModal } from 'react-native-paper-dates';
import { parseISO } from 'date-fns';

export const EditBimbinganScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { id, bimbingan } = route.params;

  const [tanggal, setTanggal] = useState<Date>(parseISO(bimbingan.tanggal));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [topik, setTopik] = useState(bimbingan.topik);
  const [keterangan, setKeterangan] = useState(bimbingan.keterangan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleSave = async () => {
    // Validation
    if (!topik.trim()) {
      setError('Topik wajib diisi');
      setSnackbarVisible(true);
      return;
    }

    if (topik.length > 255) {
      setError('Topik maksimal 255 karakter');
      setSnackbarVisible(true);
      return;
    }

    if (!keterangan.trim()) {
      setError('Keterangan wajib diisi');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await bimbinganService.updateBimbingan(id, {
        tanggal: formatDateForApi(tanggal),
        topik: topik.trim(),
        keterangan: keterangan.trim(),
      });

      setSuccess(true);
      setError('Bimbingan berhasil diperbarui');
      setSnackbarVisible(true);

      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (err: any) {
      console.error('Update bimbingan error:', err);
      const errorMessage =
        err.response?.data?.message || err.message || 'Gagal memperbarui bimbingan';
      setError(errorMessage);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const onConfirmDate = (params: any) => {
    setShowDatePicker(false);
    setTanggal(params.date);
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Edit Bimbingan" />
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            label="Tanggal"
            value={tanggal.toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            mode="outlined"
            editable={false}
            right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} />}
            style={styles.input}
          />

          <TextInput
            label="Topik"
            value={topik}
            onChangeText={setTopik}
            mode="outlined"
            maxLength={255}
            style={styles.input}
            disabled={loading}
          />
          <Text variant="bodySmall" style={styles.hint}>
            {topik.length}/255 karakter
          </Text>

          <TextInput
            label="Keterangan"
            value={keterangan}
            onChangeText={setKeterangan}
            mode="outlined"
            multiline
            numberOfLines={6}
            style={[styles.input, styles.textArea]}
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
              onPress={handleSave}
              style={styles.button}
              loading={loading}
              disabled={loading}
            >
              Simpan
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <DatePickerModal
        locale="id"
        mode="single"
        visible={showDatePicker}
        onDismiss={() => setShowDatePicker(false)}
        date={tanggal}
        onConfirm={onConfirmDate}
      />

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
  input: {
    marginBottom: 4,
  },
  hint: {
    opacity: 0.6,
    marginBottom: 12,
    marginLeft: 12,
  },
  textArea: {
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
