import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, Chip, useTheme } from 'react-native-paper';
import { Bimbingan } from '../types';
import { formatDateShort } from '../utils/dateFormatter';
import { STATUS_COLORS } from '../utils/constants';

interface BimbinganListItemProps {
  bimbingan: Bimbingan;
  onPress: () => void;
}

export const BimbinganListItem: React.FC<BimbinganListItemProps> = ({ bimbingan, onPress }) => {
  const theme = useTheme();

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status] || theme.colors.primary;
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <Text variant="bodySmall" style={styles.date}>
          {formatDateShort(bimbingan.tanggal)}
        </Text>
        <Text variant="titleMedium" style={styles.topik} numberOfLines={1}>
          {bimbingan.topik}
        </Text>
        <Chip
          mode="flat"
          style={[styles.statusChip, { backgroundColor: getStatusColor(bimbingan.status) }]}
          textStyle={{ color: '#fff', fontSize: 12 }}
        >
          {bimbingan.status}
        </Chip>
        <Text variant="bodySmall" style={styles.keterangan} numberOfLines={2}>
          {bimbingan.keterangan}
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  date: {
    opacity: 0.6,
    marginBottom: 4,
  },
  topik: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  keterangan: {
    opacity: 0.7,
  },
});
