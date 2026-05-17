import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

/**
 * Wrapper konsisten untuk icon bottom-tab menggunakan Lucide.
 * Mendukung micro-animation saat focus berubah:
 * - Scale "pop" (1 → 1.18 → 1)
 * - Bounce vertikal halus
 * Pakai stroke-based icons untuk feel modern/minimal.
 */
export function TabIcon({
  Icon,
  color,
  focused,
}: {
  Icon: LucideIcon;
  color: string;
  focused: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const prevFocused = useRef(focused);

  useEffect(() => {
    // Hanya animate saat transisi unfocused → focused
    if (focused && !prevFocused.current) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.18,
            duration: 140,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -3,
            duration: 140,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1,
            friction: 4,
            tension: 140,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            friction: 4,
            tension: 140,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
    prevFocused.current = focused;
  }, [focused, scale, translateY]);

  return (
    <Animated.View style={{ transform: [{ scale }, { translateY }] }}>
      <Icon size={22} color={color} strokeWidth={focused ? 2.4 : 1.8} />
    </Animated.View>
  );
}
