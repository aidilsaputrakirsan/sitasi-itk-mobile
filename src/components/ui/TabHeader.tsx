import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette } from '../../theme';

export interface TabHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onRightPress?: () => void;
  /** Variant warna — 'primary' (biru) atau 'surface' (putih). Default 'surface'. */
  variant?: 'primary' | 'surface';
}

/**
 * Slim sticky header untuk TAB screens (Akademik, Bimbingan, Profil, dst).
 * Beda dengan AnimatedHeader (stack): tidak collapse, tetap minimalis,
 * tugas utamanya hanya memberi safe-area top + identitas screen.
 */
export function TabHeader({
  title,
  subtitle,
  right,
  onRightPress,
  variant = 'surface',
}: TabHeaderProps) {
  const insets = useSafeAreaInsets();
  const isPrimary = variant === 'primary';

  return (
    <View
      style={[
        styles.container,
        isPrimary ? styles.bgPrimary : styles.bgSurface,
        { paddingTop: insets.top + 8 },
      ]}
    >
      <View style={styles.row}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={[styles.title, isPrimary && styles.titleOnPrimary]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[styles.subtitle, isPrimary && styles.subtitleOnPrimary]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right ? (
          onRightPress ? (
            <Pressable
              onPress={onRightPress}
              hitSlop={10}
              style={({ pressed }) => [
                styles.rightBtn,
                pressed && { opacity: 0.6 },
              ]}
            >
              {right}
            </Pressable>
          ) : (
            <View style={styles.rightBtn}>{right}</View>
          )
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  bgSurface: {
    backgroundColor: palette.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.outlineVariant,
  },
  bgPrimary: { backgroundColor: palette.primary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: palette.onSurface,
    letterSpacing: 0.2,
  },
  titleOnPrimary: { color: '#fff' },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: palette.onSurfaceVariant,
    marginTop: 2,
  },
  subtitleOnPrimary: { color: 'rgba(255,255,255,0.85)' },
  rightBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
