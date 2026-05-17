import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { palette } from '../../theme';

interface LoadingScreenProps {
  message?: string;
  /** Optional Lottie source. Jika tidak diberikan & file default tidak ada, fallback ke ActivityIndicator. */
  lottieSource?: any;
  size?: number;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const defaultLottie = require('../../../assets/lottie/loading.json');

export function LoadingScreen({
  message,
  lottieSource,
  size = 140,
}: LoadingScreenProps) {
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
        <ActivityIndicator size="large" color={palette.primary} />
      )}
      {message ? <Text style={styles.text}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.background,
  },
  text: {
    marginTop: 8,
    fontSize: 14,
    color: palette.onSurfaceVariant,
  },
});
