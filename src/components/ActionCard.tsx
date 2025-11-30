import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ActionCardProps {
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  onPress: () => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  color,
  onPress,
}) => {
  const theme = useTheme();

  return (
    <Card style={[styles.card, { backgroundColor: color }]} onPress={onPress}>
      <Card.Content style={styles.content}>
        <MaterialCommunityIcons name={icon} size={48} color="#fff" />
        <Text variant="titleLarge" style={styles.title}>
          {title}
        </Text>
        <Text variant="bodySmall" style={styles.description}>
          {description}
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    elevation: 4,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },
  description: {
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.9,
  },
});
