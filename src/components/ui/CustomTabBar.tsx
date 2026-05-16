import React from 'react';
import { View, StyleSheet, Platform, Pressable } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { palette } from '../../theme';

/**
 * Floating pill tab bar (Shopify-style):
 *   - Container transparan dengan inset bawah safe area
 *   - Pill putih melayang dengan shadow & rounded full
 *   - Active item: highlight pill + label muncul
 *   - Inactive item: icon only
 *   - Badge merah di kanan-atas icon untuk unread count
 */
export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 12);

  return (
    <View
      style={[styles.outer, { paddingBottom: bottomPad }]}
      pointerEvents="box-none"
    >
      <Surface elevation={4} style={styles.pill}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : typeof options.title === 'string'
              ? options.title
              : route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          const color = isFocused ? palette.primary : palette.onSurfaceVariant;

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              style={({ pressed }) => [
                styles.tab,
                isFocused && styles.tabActive,
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={styles.iconWrap}>
                {options.tabBarIcon &&
                  options.tabBarIcon({
                    focused: isFocused,
                    color,
                    size: 22,
                  })}
                {options.tabBarBadge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText} numberOfLines={1}>
                      {String(options.tabBarBadge)}
                    </Text>
                  </View>
                ) : null}
              </View>
              {isFocused && (
                <Text variant="labelMedium" style={styles.label} numberOfLines={1}>
                  {label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: palette.background,
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
    alignItems: 'center',
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    gap: 6,
    minWidth: 44,
  },
  tabActive: {
    backgroundColor: palette.primaryContainer,
    paddingHorizontal: 14,
  },
  iconWrap: { position: 'relative' },
  label: {
    color: palette.primary,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: palette.error,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 12,
  },
});
