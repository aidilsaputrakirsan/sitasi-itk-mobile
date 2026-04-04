import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { semproApi } from '../../api/endpoints/sempro';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import type { Sempro } from '../../types';

export function SemproScreen() {
  const [data, setData] = useState<Sempro | null>(null);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await semproApi.myStatus();
      if (response.data.success) {
        setRegistered(response.data.data.registered);
        setData(response.data.data.sempro ?? null);
      }
    } catch { /* silent */ } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);
  const onRefresh = () => { setRefreshing(true); fetchStatus(); };

  const pickFile = async (label: string): Promise<{ uri: string; type: string; name: string } | null> => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (result.canceled) return null;
    const file = result.assets[0];
    return { uri: file.uri, type: file.mimeType ?? 'application/pdf', name: file.name ?? `${label}.pdf` };
  };

  const handleRegister = async () => {
    try {
      const formTa012 = await pickFile('form_ta_012');
      if (!formTa012) return;
      const buktiPlagiasi = await pickFile('bukti_plagiasi');
      if (!buktiPlagiasi) return;
      const proposalTa = await pickFile('proposal_ta');
      if (!proposalTa) return;

      setSubmitting(true);
      const formData = new FormData();
      formData.append('form_ta_012', formTa012 as unknown as Blob);
      formData.append('bukti_plagiasi', buktiPlagiasi as unknown as Blob);
      formData.append('proposal_ta', proposalTa as unknown as Blob);

      await semproApi.register(formData);
      Alert.alert('Berhasil', 'Pendaftaran sempro berhasil');
      fetchStatus();
    } catch (err: unknown) {
      const error = err as { message?: string; errors?: Record<string, string[]> };
      const msg = error.errors
        ? Object.values(error.errors).flat().join('\n')
        : error.message ?? 'Gagal mendaftar sempro';
      Alert.alert('Gagal', msg);
    } finally { setSubmitting(false); }
  };

  if (loading) return <LoadingScreen />;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {!registered ? (
        <View style={styles.registerCard}>
          <Text style={styles.registerTitle}>Daftar Seminar Proposal</Text>
          <Text style={styles.registerDesc}>
            Upload dokumen berikut untuk mendaftar sempro:{'\n'}
            1. Form TA-012 (PDF, maks 5MB){'\n'}
            2. Bukti Plagiasi (PDF, maks 5MB){'\n'}
            3. Proposal TA (PDF, maks 10MB)
          </Text>
          <TouchableOpacity
            style={[styles.registerButton, submitting && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={submitting}
          >
            {submitting ? <ActivityIndicator color="#fff" /> : (
              <Text style={styles.registerButtonText}>Pilih File & Daftar</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : data ? (
        <>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Status</Text>
              <StatusBadge status={data.status} />
            </View>
            {data.pembimbing_1 && <InfoRow label="Pembimbing 1" value={data.pembimbing_1.nama} />}
            {data.pembimbing_2 && <InfoRow label="Pembimbing 2" value={data.pembimbing_2.nama} />}
            {data.penguji_1 && <InfoRow label="Penguji 1" value={data.penguji_1.nama} />}
            {data.penguji_2 && <InfoRow label="Penguji 2" value={data.penguji_2.nama} />}
          </View>
          {data.jadwal && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Jadwal</Text>
              <Text style={styles.value}>
                {new Date(data.jadwal.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
              <Text style={styles.value}>{data.jadwal.waktu_mulai} - {data.jadwal.waktu_selesai}</Text>
              {data.jadwal.ruangan && <Text style={styles.value}>Ruangan: {data.jadwal.ruangan}</Text>}
            </View>
          )}
          {data.revisi_status && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Status Revisi</Text>
              {Object.entries(data.revisi_status).map(([role, done]) => (
                <View key={role} style={styles.revisiRow}>
                  <Text style={styles.label}>{role.replace(/_/g, ' ')}</Text>
                  <Text style={[styles.revisiStatus, { color: done ? '#2E7D32' : '#E65100' }]}>
                    {done ? 'Selesai' : 'Belum'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      ) : null}
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  registerCard: { margin: 16, backgroundColor: '#fff', padding: 24, borderRadius: 12, alignItems: 'center' },
  registerTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 },
  registerDesc: { fontSize: 13, color: '#666', lineHeight: 20, marginBottom: 20 },
  registerButton: { backgroundColor: '#0066CC', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 10 },
  registerButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  card: { backgroundColor: '#fff', margin: 16, marginBottom: 0, padding: 20, borderRadius: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  label: { fontSize: 14, color: '#666', textTransform: 'capitalize' },
  value: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 8 },
  revisiRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  revisiStatus: { fontSize: 13, fontWeight: '600' },
});
