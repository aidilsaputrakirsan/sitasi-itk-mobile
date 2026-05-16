import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Lookup case-insensitive — web simpan "Approved"/"Rejected"/"Diterima"/
 * "Ditolak" (capital), mobile API simpan lowercase. Normalize ke lowercase
 * sebelum lookup, lalu juga handle alias (diterima → approved style).
 */
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  created: { bg: '#E3F2FD', text: '#1565C0' },
  pending: { bg: '#FFF3E0', text: '#E65100' },
  approved: { bg: '#E8F5E9', text: '#2E7D32' },
  diterima: { bg: '#E8F5E9', text: '#2E7D32' },
  rejected: { bg: '#FFEBEE', text: '#C62828' },
  ditolak: { bg: '#FFEBEE', text: '#C62828' },
  revision: { bg: '#FFF8E1', text: '#F57F17' },
  on_process: { bg: '#E3F2FD', text: '#1565C0' },
  scheduled: { bg: '#F3E5F5', text: '#6A1B9A' },
  active: { bg: '#E8F5E9', text: '#2E7D32' },
  inactive: { bg: '#ECEFF1', text: '#546E7A' },
};

/** Label tampil — case-insensitive dengan label friendly Bahasa Indonesia */
const STATUS_LABELS: Record<string, string> = {
  created: 'Menunggu',
  pending: 'Menunggu',
  approved: 'Disetujui',
  diterima: 'Disetujui',
  rejected: 'Ditolak',
  ditolak: 'Ditolak',
  revision: 'Revisi',
  on_process: 'Diproses',
  scheduled: 'Terjadwal',
  active: 'Aktif',
  inactive: 'Tidak Aktif',
};

interface StatusBadgeProps {
  status: string;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const key = String(status ?? '').toLowerCase();
  const colors = STATUS_COLORS[key] ?? { bg: '#ECEFF1', text: '#546E7A' };
  const displayLabel = label ?? STATUS_LABELS[key] ?? status.replace(/_/g, ' ').toUpperCase();
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{displayLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
