import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Step {
  label: string;
  completed: boolean;
}

interface StatusProgressStepperProps {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  steps: Step[];
  currentStep: number; // 0-based index, -1 for not started
  status?: 'active' | 'rejected' | 'completed';
}

export const StatusProgressStepper: React.FC<StatusProgressStepperProps> = ({
  title,
  icon,
  steps,
  currentStep,
  status = 'active',
}) => {
  const theme = useTheme();

  const getStepColor = (index: number) => {
    if (status === 'rejected') {
      return theme.colors.error;
    }
    if (index < currentStep) {
      return theme.colors.primary;
    }
    if (index === currentStep) {
      return theme.colors.primary;
    }
    return theme.colors.surfaceVariant;
  };

  const getStepIcon = (index: number) => {
    if (status === 'rejected' && index === currentStep) {
      return 'close-circle';
    }
    if (index < currentStep) {
      return 'check-circle';
    }
    return 'circle-outline';
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <MaterialCommunityIcons name={icon} size={24} color={theme.colors.primary} />
          <Text variant="titleMedium" style={styles.title}>
            {title}
          </Text>
        </View>

        {currentStep === -1 ? (
          <Text variant="bodyMedium" style={styles.notStarted}>
            Belum dimulai
          </Text>
        ) : (
          <View style={styles.stepsContainer}>
            {steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepIndicator}>
                  <MaterialCommunityIcons
                    name={getStepIcon(index)}
                    size={20}
                    color={getStepColor(index)}
                  />
                  {index < steps.length - 1 && (
                    <View
                      style={[
                        styles.connector,
                        {
                          backgroundColor:
                            index < currentStep
                              ? theme.colors.primary
                              : theme.colors.surfaceVariant,
                        },
                      ]}
                    />
                  )}
                </View>
                <Text
                  variant="bodySmall"
                  style={[
                    styles.stepLabel,
                    {
                      color:
                        index <= currentStep
                          ? theme.colors.onSurface
                          : theme.colors.onSurfaceVariant,
                      fontWeight: index === currentStep ? 'bold' : 'normal',
                    },
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        {status === 'rejected' && (
          <Text variant="bodySmall" style={[styles.statusText, { color: theme.colors.error }]}>
            Ditolak
          </Text>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginLeft: 8,
    fontWeight: '600',
  },
  notStarted: {
    fontStyle: 'italic',
    opacity: 0.7,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
  },
  stepIndicator: {
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  connector: {
    position: 'absolute',
    left: 10,
    top: 10,
    width: 60,
    height: 2,
  },
  stepLabel: {
    textAlign: 'center',
    fontSize: 10,
  },
  statusText: {
    marginTop: 8,
    fontWeight: 'bold',
  },
});
