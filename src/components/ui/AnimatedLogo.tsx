import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import type { ImageSourcePropType, ViewStyle } from 'react-native';

interface AnimatedLogoProps {
  source: ImageSourcePropType;
  size?: number;
  /** Tampilkan halo/glow di belakang logo. Default false (pure logo). */
  glow?: boolean;
  /** Warna glow (default putih semi-transparan, cocok di atas primary). */
  glowColor?: string;
  style?: ViewStyle;
}

/**
 * Logo dengan micro-animation loop: float (translateY) + pulse (scale) + glow breathing.
 * Tanpa background kotak — logo "melayang" langsung di atas parent.
 */
export function AnimatedLogo({
  source,
  size = 72,
  glow = false,
  glowColor = 'rgba(255,255,255,0.35)',
  style,
}: AnimatedLogoProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.5)).current;
  const glowScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Float up-down (3s loop)
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -4,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    // Pulse scale (4s loop, slight)
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    // Glow breathing (opacity + scale, 2.5s loop)
    const glowLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 0.9,
            duration: 1250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.4,
            duration: 1250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(glowScale, {
            toValue: 1.25,
            duration: 1250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(glowScale, {
            toValue: 1,
            duration: 1250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    floatLoop.start();
    pulseLoop.start();
    glowLoop.start();

    return () => {
      floatLoop.stop();
      pulseLoop.stop();
      glowLoop.stop();
    };
  }, [translateY, scale, glowOpacity, glowScale]);

  return (
    <View style={[{ width: size, height: size }, styles.container, style]}>
      {glow ? (
        <Animated.View
          style={[
            styles.glow,
            {
              backgroundColor: glowColor,
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        />
      ) : null}
      <Animated.View
        style={{
          width: size,
          height: size,
          transform: [{ translateY }, { scale }],
        }}
      >
        <Image
          source={source}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: '110%',
    height: '110%',
    borderRadius: 999,
  },
});
