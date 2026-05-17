import React, { useMemo } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { palette } from '../../theme';

const HEADER_EXPANDED = 140;
const HEADER_COLLAPSED = 56;
const SCROLL_RANGE = HEADER_EXPANDED - HEADER_COLLAPSED;

export interface AnimatedHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
  scrollY: Animated.Value;
}

/**
 * Collapsible header dengan gradient-like dua layer.
 * Saat scroll: tinggi mengecil (140 → 56), judul besar fade-out,
 * judul kecil di toolbar fade-in. Pair dengan `useCollapsibleHeader`.
 */
export function AnimatedHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  right,
  scrollY,
}: AnimatedHeaderProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const height = scrollY.interpolate({
    inputRange: [0, SCROLL_RANGE],
    outputRange: [HEADER_EXPANDED + insets.top, HEADER_COLLAPSED + insets.top],
    extrapolate: 'clamp',
  });

  const bigTitleOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_RANGE * 0.6, SCROLL_RANGE],
    outputRange: [1, 0.4, 0],
    extrapolate: 'clamp',
  });

  const bigTitleTranslate = scrollY.interpolate({
    inputRange: [0, SCROLL_RANGE],
    outputRange: [0, -12],
    extrapolate: 'clamp',
  });

  const smallTitleOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_RANGE * 0.5, SCROLL_RANGE],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const accentOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_RANGE],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const shadowOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_RANGE],
    outputRange: [0, 0.18],
    extrapolate: 'clamp',
  });

  const handleBack = () => {
    if (onBack) onBack();
    else if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height,
          paddingTop: insets.top,
          shadowOpacity: Platform.OS === 'ios' ? shadowOpacity : 0,
        },
      ]}
    >
      {/* Accent layer (darker bottom gradient effect) */}
      <Animated.View style={[styles.accent, { opacity: accentOpacity }]} />

      {/* Toolbar row (back + small title + right) */}
      <View style={styles.toolbar}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            hitSlop={10}
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
          >
            <ArrowLeft size={22} color="#fff" />
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}

        <Animated.Text
          numberOfLines={1}
          style={[styles.smallTitle, { opacity: smallTitleOpacity }]}
        >
          {title}
        </Animated.Text>

        <View style={styles.rightSlot}>{right}</View>
      </View>

      {/* Big title (expanded state) */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.bigTitleWrap,
          {
            opacity: bigTitleOpacity,
            transform: [{ translateY: bigTitleTranslate }],
          },
        ]}
      >
        <Text style={styles.bigTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </Animated.View>
    </Animated.View>
  );
}

/**
 * Spacer untuk menggantikan tinggi header (karena header posisinya absolute).
 * Letakkan sebagai child pertama Animated.ScrollView/FlatList contentContainer.
 */
export function HeaderSpacer() {
  const insets = useSafeAreaInsets();
  return <View style={{ height: HEADER_EXPANDED + insets.top }} />;
}

export function useCollapsibleHeader(): {
  scrollY: Animated.Value;
  scrollProps: Pick<ScrollViewProps, 'onScroll' | 'scrollEventThrottle'>;
  contentContainerPaddingTop: number;
} {
  const scrollY = useMemo(() => new Animated.Value(0), []);
  const insets = useSafeAreaInsets();

  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: false,
      }),
    [scrollY],
  );

  return {
    scrollY,
    scrollProps: { onScroll, scrollEventThrottle: 16 },
    contentContainerPaddingTop: HEADER_EXPANDED + insets.top,
  };
}

export const ANIMATED_HEADER_HEIGHTS = {
  expanded: HEADER_EXPANDED,
  collapsed: HEADER_COLLAPSED,
} as const;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: palette.primary,
    overflow: 'hidden',
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  accent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    backgroundColor: palette.primaryDark,
    opacity: 1,
  },
  toolbar: {
    height: HEADER_COLLAPSED,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'left',
    marginLeft: 4,
  },
  rightSlot: {
    minWidth: 40,
    height: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 4,
  },
  bigTitleWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 16,
  },
  bigTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
});
