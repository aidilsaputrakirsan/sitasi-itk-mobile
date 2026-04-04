import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  created: { bg: '#E3F2FD', text: '#1565C0' },
  pending: { bg: '#FFF3E0', text: '#E65100' },
  approved: { bg: '#E8F5E9', text: '#2E7D32' },
  rejected: { bg: '#FFEBEE', text: '#C62828' },
  revision: { bg: '#FFF8E1', text: '#F57F17' },
  on_process: { bg: '#E3F2FD', text: '#1565C0' },
  scheduled: { bg: '#F3E5F5', text: '#6A1B9A' },
  Diterima: { bg: '#E8F5E9', text: '#2E7D32' },
  Ditolak: { bg: '#FFEBEE', text: '#C62828' },
  active: { bg: '#E8F5E9', text: '#2E7D32' },
  inactive: { bg: '#ECEFF1', text: '#546E7A' },
};

interface StatusBadgeProps {
  status: string;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status] ?? { bg: '#ECEFF1', text: '#546E7A' };
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>
        {label ?? status.replace(/_/g, ' ').toUpperCase()}
      </Text>
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
