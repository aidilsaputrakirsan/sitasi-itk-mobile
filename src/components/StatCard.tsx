import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const theme = useTheme();
  const iconColor = color || theme.colors.primary;

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <MaterialCommunityIcons name={icon} size={40} color={iconColor} />
        <Text variant="headlineMedium" style={styles.value}>
          {value}
        </Text>
        <Text variant="bodyMedium" style={styles.title}>
          {title}
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  value: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  title: {
    textAlign: 'center',
    marginTop: 4,
  },
});
