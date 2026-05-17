import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { Inbox } from 'lucide-react-native';
import { palette } from '../../theme';

interface EmptyStateProps {
  message?: string;
  /** Optional Lottie source — require('../../../assets/lottie/xxx.json'). Jika undefined, pakai icon statis. */
  lottieSource?: any;
  /** Ukuran animasi Lottie (default 160). */
  size?: number;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const defaultLottie = require('../../../assets/lottie/empty.json');

export function EmptyState({
  message = 'Belum ada data',
  lottieSource,
  size = 160,
}: EmptyStateProps) {
  const source = lottieSource ?? defaultLottie;

  return (
    <View style={styles.container}>
      {source ? (
        <LottieView
          source={source}
          autoPlay
          loop
          style={{ width: size, height: size }}
        />
      ) : (
        <View style={styles.iconFallback}>
          <Inbox size={56} color={palette.outline} strokeWidth={1.5} />
        </View>
      )}
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconFallback: { marginBottom: 12, opacity: 0.7 },
  text: {
    fontSize: 15,
    color: palette.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 8,
  },
});
