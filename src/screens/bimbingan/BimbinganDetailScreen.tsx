import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  Appbar,
  Dialog,
  Portal,
  Snackbar,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { bimbinganService } from '../../services/bimbinganService';
import { Bimbingan } from '../../types';
import { formatDate } from '../../utils/dateFormatter';
import { STATUS_COLORS } from '../../utils/constants';

export const BimbinganDetailScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params;

  const [bimbingan, setBimbingan] = useState<Bimbingan | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadBimbingan();
  }, [id]);

  const loadBimbingan = async () => {
    try {
      const data = await bimbinganService.getBimbinganById(id);
      setBimbingan(data);
    } catch (error) {
      console.error('Failed to load bimbingan:', error);
      setSnackbarMessage('Gagal memuat data bimbingan');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await bimbinganService.deleteBimbingan(id);
      setDeleteDialogVisible(false);
      setSnackbarMessage('Bimbingan berhasil dihapus');
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error) {
      console.error('Failed to delete bimbingan:', error);
      setSnackbarMessage('Gagal menghapus bimbingan');
      setSnackbarVisible(true);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status] || theme.colors.primary;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Detail Bimbingan" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </View>
    );
  }

  if (!bimbingan) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Detail Bimbingan" />
        </Appbar.Header>
        <View style={styles.centerContainer}>
          <Text>Bimbingan tidak ditemukan</Text>
        </View>
      </View>
    );
  }

  const canEdit = bimbingan.status === 'Pending';

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Detail Bimbingan" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyMedium" style={styles.date}>
              {formatDate(bimbingan.tanggal)}
            </Text>

            <Text variant="headlineSmall" style={styles.topik}>
              {bimbingan.topik}
            </Text>

            <Chip
              mode="flat"
              style={[
                styles.statusChip,
                { backgroundColor: getStatusColor(bimbingan.status) },
              ]}
              textStyle={{ color: '#fff' }}
            >
              {bimbingan.status}
            </Chip>

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Keterangan
              </Text>
              <Text variant="bodyMedium" style={styles.keterangan}>
                {bimbingan.keterangan}
              </Text>
            </View>

            {bimbingan.catatan_dosen && (
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Catatan Dosen
                </Text>
                <Card style={styles.dosenCard}>
                  <Card.Content>
                    <Text variant="bodyMedium">{bimbingan.catatan_dosen}</Text>
                  </Card.Content>
                </Card>
              </View>
            )}
          </Card.Content>
        </Card>

        {canEdit && (
          <View style={styles.actions}>
            <Button
              mode="contained"
              icon="pencil"
              onPress={() =>
                navigation.navigate('EditBimbingan', { id, bimbingan })
              }
              style={styles.actionButton}
            >
              Edit
            </Button>

            <Button
              mode="outlined"
              icon="delete"
              onPress={() => setDeleteDialogVisible(true)}
              style={styles.actionButton}
              textColor={theme.colors.error}
            >
              Hapus
            </Button>
          </View>
        )}
      </ScrollView>

      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Hapus Bimbingan?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Anda yakin ingin menghapus bimbingan ini?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)} disabled={deleting}>
              Batal
            </Button>
            <Button
              onPress={handleDelete}
              textColor={theme.colors.error}
              loading={deleting}
              disabled={deleting}
            >
              Hapus
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  date: {
    opacity: 0.6,
    marginBottom: 8,
  },
  topik: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  keterangan: {
    lineHeight: 22,
  },
  dosenCard: {
    backgroundColor: 'rgba(0, 61, 130, 0.05)',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
  },
});
