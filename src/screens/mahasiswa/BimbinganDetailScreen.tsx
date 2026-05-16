import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Button,
  Card,
  Dialog,
  Divider,
  Portal,
  Snackbar,
  Surface,
  Text,
} from 'react-native-paper';
import {
  Calendar,
  FileText,
  GraduationCap,
  MessageSquare,
  Pencil,
  Trash2,
} from 'lucide-react-native';
import { bimbinganApi } from '../../api/endpoints/bimbingan';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { palette } from '../../theme';
import type { Bimbingan } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'BimbinganDetail'>;

export function BimbinganDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const [data, setData] = useState<Bimbingan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [snack, setSnack] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const response = await bimbinganApi.getById(id);
        if (response.data.success) setData(response.data.data);
      } catch (err: unknown) {
        setError((err as { message?: string }).message ?? 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const confirmDelete = async () => {
    if (!data) return;
    setDeleting(true);
    try {
      await bimbinganApi.delete(data.id);
      setDeleteOpen(false);
      setSnack({ visible: true, message: 'Bimbingan berhasil dihapus' });
      setTimeout(() => navigation.goBack(), 600);
    } catch (err: unknown) {
      setDeleteOpen(false);
      setSnack({
        visible: true,
        message: (err as { message?: string }).message ?? 'Gagal menghapus',
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (error || !data) return <ErrorMessage message={error ?? 'Data tidak ditemukan'} />;

  const dateLabel = new Date(data.tanggal).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Status hero */}
        <Surface elevation={0} style={styles.statusHero}>
          <Text variant="labelSmall" style={styles.statusLabel}>
            STATUS BIMBINGAN
          </Text>
          <View style={{ marginTop: 8 }}>
            <StatusBadge status={data.status} />
          </View>
          <Text variant="headlineSmall" style={styles.dateLarge}>
            {dateLabel}
          </Text>
        </Surface>

        {/* Info card */}
        <Card mode="elevated" style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <InfoRow Icon={Calendar} label="Tanggal" value={dateLabel} />
            {data.dosen?.name && (
              <>
                <Divider />
                <InfoRow Icon={GraduationCap} label="Dosen Pembimbing" value={data.dosen.name} />
              </>
            )}
          </Card.Content>
        </Card>

        {/* Keterangan */}
        <Card mode="elevated" style={styles.card}>
          <Card.Content>
            <View style={styles.sectionLabel}>
              <FileText size={16} color={palette.primary} strokeWidth={2} />
              <Text variant="labelLarge" style={styles.sectionLabelText}>
                Keterangan Bimbingan
              </Text>
            </View>
            <Text variant="bodyMedium" style={styles.content}>
              {data.ket_bimbingan}
            </Text>
          </Card.Content>
        </Card>

        {/* Hasil */}
        {data.hasil_bimbingan && (
          <Card mode="elevated" style={styles.card}>
            <Card.Content>
              <View style={styles.sectionLabel}>
                <MessageSquare size={16} color={palette.success} strokeWidth={2} />
                <Text variant="labelLarge" style={styles.sectionLabelText}>
                  Hasil Bimbingan
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.content}>
                {data.hasil_bimbingan}
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Action buttons — fixed bottom (hanya saat status created) */}
      {data.status === 'created' && (
        <Surface elevation={3} style={styles.actionBar}>
          <Button
            mode="contained-tonal"
            icon={({ size, color }) => <Pencil size={size} color={color} strokeWidth={2} />}
            onPress={() => navigation.navigate('BimbinganForm', { id: data.id, data })}
            style={[styles.actionBtn, { flex: 1 }]}
            contentStyle={styles.actionContent}
          >
            Edit
          </Button>
          <Button
            mode="outlined"
            icon={({ size, color }) => <Trash2 size={size} color={color} strokeWidth={2} />}
            onPress={() => setDeleteOpen(true)}
            textColor={palette.error}
            style={[styles.actionBtn, styles.deleteBtn, { flex: 1 }]}
            contentStyle={styles.actionContent}
          >
            Hapus
          </Button>
        </Surface>
      )}

      <Portal>
        <Dialog visible={deleteOpen} onDismiss={() => setDeleteOpen(false)}>
          <Dialog.Title>Hapus Bimbingan?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Bimbingan yang sudah dihapus tidak dapat dikembalikan.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteOpen(false)} disabled={deleting}>
              Batal
            </Button>
            <Button onPress={confirmDelete} loading={deleting} textColor={palette.error}>
              Hapus
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snack.visible}
        onDismiss={() => setSnack({ visible: false, message: '' })}
        duration={2500}
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
      <Surface elevation={0} style={styles.infoIcon}>
        <Icon size={18} color={palette.primary} strokeWidth={1.8} />
      </Surface>
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
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  statusHero: {
    backgroundColor: palette.primary,
    padding: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  statusLabel: {
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  dateLarge: { color: '#fff', fontWeight: '700', marginTop: 12 },

  card: {
    marginHorizontal: 16,
    marginTop: -12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  cardContent: { paddingVertical: 4 },

  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionLabelText: { color: palette.onSurface, fontWeight: '700' },

  content: { color: palette.onSurface, lineHeight: 22 },

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

  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: palette.outlineVariant,
  },
  actionBtn: { borderRadius: 12 },
  actionContent: { paddingVertical: 6 },
  deleteBtn: { borderColor: palette.errorContainer },
});
